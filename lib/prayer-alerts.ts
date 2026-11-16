import "server-only";

import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { sendNotification, setVapidDetails } from "web-push";

export const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export type PrayerName = (typeof prayerNames)[number];
export type PrayerLanguage = "ar" | "en";

export type BrowserPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type PrayerAlertSettings = {
  subscription: BrowserPushSubscription;
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  language: PrayerLanguage;
};

type StoredSubscription = PrayerAlertSettings & {
  timezone: string;
  scheduledThrough: string;
};

type ScheduledPrayer = {
  member: string;
  timestamp: number;
};

type CalendarDay = {
  timings: Record<PrayerName, string>;
  meta: {
    timezone: string;
  };
};

export class PrayerAlertError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PrayerAlertError";
  }
}

const dueSet = "prayer-alerts:due";
const refreshSet = "prayer-alerts:refresh";
const prayerLabels: Record<PrayerName, { ar: string; en: string }> = {
  Fajr: { ar: "الفجر", en: "Fajr" },
  Dhuhr: { ar: "الظهر", en: "Dhuhr" },
  Asr: { ar: "العصر", en: "Asr" },
  Maghrib: { ar: "المغرب", en: "Maghrib" },
  Isha: { ar: "العشاء", en: "Isha" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown, name: string, maximumLength: number) {
  if (typeof value !== "string" || value.length === 0 || value.length > maximumLength) {
    throw new PrayerAlertError(`Invalid ${name}.`, 400);
  }
  return value;
}

function endpointIsSupported(endpoint: string) {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }

  const host = url.hostname.toLowerCase();
  return (
    url.protocol === "https:" &&
    url.username.length === 0 &&
    url.password.length === 0 &&
    url.port.length === 0 &&
    (host === "fcm.googleapis.com" ||
      host === "updates.push.services.mozilla.com" ||
      host === "push.services.mozilla.com" ||
      host.endsWith(".push.services.mozilla.com") ||
      host.endsWith(".push.apple.com") ||
      host === "push.services.opera.com" ||
      host.endsWith(".notify.windows.com"))
  );
}

export function parsePrayerAlertSettings(value: unknown): PrayerAlertSettings {
  if (!isRecord(value) || !isRecord(value.subscription) || !isRecord(value.subscription.keys)) {
    throw new PrayerAlertError("Invalid notification subscription.", 400);
  }

  const endpoint = requiredString(value.subscription.endpoint, "subscription endpoint", 2048);
  const p256dh = requiredString(value.subscription.keys.p256dh, "subscription key", 256);
  const auth = requiredString(value.subscription.keys.auth, "subscription key", 256);
  if (!endpointIsSupported(endpoint) || p256dh.length < 16 || auth.length < 8) {
    throw new PrayerAlertError("Unsupported notification subscription.", 400);
  }

  const latitude = value.latitude;
  const longitude = value.longitude;
  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new PrayerAlertError("Invalid location coordinates.", 400);
  }

  const method = value.method;
  const school = value.school;
  const language = value.language;
  if (
    typeof method !== "number" ||
    ![1, 2, 3, 4, 5].includes(method) ||
    typeof school !== "number" ||
    ![0, 1].includes(school) ||
    (language !== "ar" && language !== "en")
  ) {
    throw new PrayerAlertError("Invalid prayer alert settings.", 400);
  }

  return {
    subscription: {
      endpoint,
      expirationTime:
        typeof value.subscription.expirationTime === "number"
          ? value.subscription.expirationTime
          : null,
      keys: { p256dh, auth },
    },
    latitude,
    longitude,
    method,
    school,
    language,
  };
}

export function parsePushEndpoint(value: unknown) {
  const endpoint = requiredString(value, "subscription endpoint", 2048);
  if (!endpointIsSupported(endpoint)) {
    throw new PrayerAlertError("Unsupported notification subscription.", 400);
  }
  return endpoint;
}

export function getPublicVapidKey() {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (
    !key ||
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.VAPID_SUBJECT ||
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN ||
    !process.env.QSTASH_CURRENT_SIGNING_KEY ||
    !process.env.QSTASH_NEXT_SIGNING_KEY
  ) {
    throw new PrayerAlertError("Prayer notifications are not configured yet.", 503);
  }
  return key;
}

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new PrayerAlertError("Prayer notifications are not configured yet.", 503);
  }
  return { publicKey, privateKey, subject };
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new PrayerAlertError("Prayer notification storage is not configured yet.", 503);
  }
  return new Redis({ url, token });
}

function subscriptionId(endpoint: string) {
  return createHash("sha256").update(endpoint).digest("hex");
}

function subscriptionKey(id: string) {
  return `prayer-alerts:subscription:${id}`;
}

function pendingKey(id: string) {
  return `prayer-alerts:pending:${id}`;
}

function monthAtOffset(date: Date, offset: number) {
  const month = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
  return {
    year: month.getUTCFullYear(),
    month: month.getUTCMonth() + 1,
  };
}

function monthEnd(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function refreshTime(scheduledThrough: string) {
  return Math.floor(Date.parse(`${scheduledThrough}T00:00:00Z`) / 1000) - 7 * 24 * 60 * 60;
}

async function fetchCalendar(
  latitude: number,
  longitude: number,
  method: number,
  school: number,
  year: number,
  month: number,
): Promise<CalendarDay[]> {
  const url = new URL(`https://api.aladhan.com/v1/calendar/${year}/${month}`);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("method", String(method));
  url.searchParams.set("school", String(school));
  url.searchParams.set("iso8601", "true");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new PrayerAlertError("Could not retrieve prayer schedules.", 502);
  }

  const body: unknown = await response.json();
  if (!isRecord(body) || body.code !== 200 || !Array.isArray(body.data)) {
    throw new PrayerAlertError("Prayer schedule response had an unexpected format.", 502);
  }

  const days: CalendarDay[] = [];
  for (const item of body.data) {
    if (!isRecord(item) || !isRecord(item.timings) || !isRecord(item.meta)) {
      throw new PrayerAlertError("Prayer schedule response had an unexpected format.", 502);
    }

    const timings = {} as Record<PrayerName, string>;
    for (const name of prayerNames) {
      const time = item.timings[name];
      if (typeof time !== "string" || Number.isNaN(Date.parse(time))) {
        throw new PrayerAlertError("Prayer schedule response had an unexpected format.", 502);
      }
      timings[name] = time;
    }
    if (typeof item.meta.timezone !== "string") {
      throw new PrayerAlertError("Prayer schedule response had an unexpected format.", 502);
    }
    days.push({ timings, meta: { timezone: item.meta.timezone } });
  }

  return days;
}

function scheduledPrayers(id: string, days: CalendarDay[], now: number): ScheduledPrayer[] {
  const prayers: ScheduledPrayer[] = [];
  for (const day of days) {
    for (const prayer of prayerNames) {
      const time = day.timings[prayer];
      const timestamp = Math.floor(Date.parse(time) / 1000);
      if (timestamp <= now) continue;
      const date = time.slice(0, 10);
      prayers.push({ member: `${id}|${date}|${prayer}|${timestamp}`, timestamp });
    }
  }
  return prayers;
}

async function addScheduledPrayers(
  redis: Redis,
  id: string,
  prayers: ScheduledPrayer[],
) {
  if (prayers.length === 0) return;
  const pipeline = redis.pipeline();
  for (const prayer of prayers) {
    pipeline.zadd(dueSet, { score: prayer.timestamp, member: prayer.member });
    pipeline.sadd(pendingKey(id), prayer.member);
  }
  await pipeline.exec();
}

async function clearScheduledPrayers(redis: Redis, id: string) {
  const pending = await redis.smembers<string[]>(pendingKey(id));
  if (pending.length > 0) {
    const pipeline = redis.pipeline();
    for (const member of pending) pipeline.zrem(dueSet, member);
    await pipeline.exec();
  }
  await redis.del(pendingKey(id));
}

async function initialSchedule(settings: PrayerAlertSettings, id: string) {
  const now = Math.floor(Date.now() / 1000);
  const months = [-1, 0, 1].map((offset) => monthAtOffset(new Date(), offset));
  const calendars = await Promise.all(
    months.map(({ year, month }) =>
      fetchCalendar(
        settings.latitude,
        settings.longitude,
        settings.method,
        settings.school,
        year,
        month,
      ),
    ),
  );
  const throughMonth = months[2];
  const scheduledThrough = monthEnd(throughMonth.year, throughMonth.month);
  const days = calendars.flat();
  const timezone = days[0]?.meta.timezone;
  if (!timezone) {
    throw new PrayerAlertError("Prayer schedule did not include a time zone.", 502);
  }
  return {
    timezone,
    scheduledThrough,
    refreshAt: refreshTime(scheduledThrough),
    prayers: scheduledPrayers(id, days, now),
  };
}

export async function savePrayerSubscription(settings: PrayerAlertSettings) {
  getVapidConfig();
  const redis = getRedis();
  const id = subscriptionId(settings.subscription.endpoint);
  const key = subscriptionKey(id);
  const existing = await redis.get<StoredSubscription>(key);

  if (
    existing &&
    existing.latitude === settings.latitude &&
    existing.longitude === settings.longitude &&
    existing.method === settings.method &&
    existing.school === settings.school
  ) {
    await redis.set(key, { ...existing, language: settings.language });
    return;
  }

  const schedule = await initialSchedule(settings, id);
  await clearScheduledPrayers(redis, id);
  const stored: StoredSubscription = {
    ...settings,
    timezone: schedule.timezone,
    scheduledThrough: schedule.scheduledThrough,
  };

  await redis.set(key, stored);
  await addScheduledPrayers(redis, id, schedule.prayers);
  await redis.zadd(refreshSet, { score: schedule.refreshAt, member: id });
}

async function removeSubscription(redis: Redis, id: string) {
  await clearScheduledPrayers(redis, id);
  await redis.del(subscriptionKey(id));
  await redis.zrem(refreshSet, id);
}

export async function deletePrayerSubscription(endpoint: string) {
  const redis = getRedis();
  await removeSubscription(redis, subscriptionId(endpoint));
}

async function refreshSubscription(redis: Redis, id: string, now: number) {
  const key = subscriptionKey(id);
  const stored = await redis.get<StoredSubscription>(key);
  if (!stored) {
    await redis.zrem(refreshSet, id);
    return;
  }

  const [yearText, monthText] = stored.scheduledThrough.split("-");
  const month = monthAtOffset(
    new Date(Date.UTC(Number(yearText), Number(monthText) - 1, 1)),
    1,
  );
  const days = await fetchCalendar(
    stored.latitude,
    stored.longitude,
    stored.method,
    stored.school,
    month.year,
    month.month,
  );
  const scheduledThrough = monthEnd(month.year, month.month);
  await addScheduledPrayers(redis, id, scheduledPrayers(id, days, now));
  await redis.set(key, { ...stored, scheduledThrough, timezone: days[0]?.meta.timezone ?? stored.timezone });
  await redis.zadd(refreshSet, {
    score: refreshTime(scheduledThrough),
    member: id,
  });
}

function parseScheduledMember(member: string) {
  const [id, date, prayer, timestampText, ...rest] = member.split("|");
  const timestamp = Number(timestampText);
  if (
    rest.length > 0 ||
    !/^[a-f\d]{64}$/.test(id ?? "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ||
    !prayerNames.includes(prayer as PrayerName) ||
    !Number.isSafeInteger(timestamp)
  ) {
    return null;
  }
  return { id, date, prayer: prayer as PrayerName, timestamp };
}

async function removeScheduledPrayer(redis: Redis, id: string, member: string) {
  await redis.zrem(dueSet, member);
  await redis.srem(pendingKey(id), member);
}

function webPushStatus(error: unknown) {
  if (
    error instanceof Error &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }
  return null;
}

async function deliverPrayerAlert(redis: Redis, member: string, now: number) {
  const scheduled = parseScheduledMember(member);
  if (!scheduled) {
    await redis.zrem(dueSet, member);
    return false;
  }

  const key = subscriptionKey(scheduled.id);
  const stored = await redis.get<StoredSubscription>(key);
  if (!stored) {
    await removeScheduledPrayer(redis, scheduled.id, member);
    return false;
  }

  const prayerTime = scheduled.timestamp;
  if (now - prayerTime > 10 * 60) {
    await removeScheduledPrayer(redis, scheduled.id, member);
    return false;
  }

  const label = prayerLabels[scheduled.prayer][stored.language];
  const title =
    stored.language === "ar" ? `حان وقت صلاة ${label}` : `${label} prayer time`;
  const body =
    stored.language === "ar"
      ? "حان الآن وقت الصلاة."
      : `It is now time for ${label}.`;

  try {
    await sendNotification(
      stored.subscription,
      JSON.stringify({
        title,
        body,
        url: "/prayer-times",
        tag: `prayer-${scheduled.date}-${scheduled.prayer}`,
      }),
      { TTL: 600, urgency: "high" },
    );
    await removeScheduledPrayer(redis, scheduled.id, member);
    return true;
  } catch (error) {
    const status = webPushStatus(error);
    if (status === 404 || status === 410) {
      await removeSubscription(redis, scheduled.id);
      return false;
    }
    console.error("Prayer push delivery failed.", {
      status,
      subscriptionId: scheduled.id,
      prayer: scheduled.prayer,
    });
    if (now - prayerTime > 10 * 60) {
      await removeScheduledPrayer(redis, scheduled.id, member);
    }
    return false;
  }
}

export async function processPrayerAlertQueue() {
  const config = getVapidConfig();
  const redis = getRedis();
  const lock = await redis.set("prayer-alerts:cron-lock", "locked", {
    nx: true,
    ex: 55,
  });
  if (lock !== "OK") return { skipped: true, sent: 0 };

  setVapidDetails(config.subject, config.publicKey, config.privateKey);
  const now = Math.floor(Date.now() / 1000);
  const refreshIds = await redis.zrange<string[]>(refreshSet, "-inf", now, {
    byScore: true,
    offset: 0,
    count: 25,
  });

  for (const id of refreshIds) {
    try {
      await refreshSubscription(redis, id, now);
    } catch (error) {
      console.error("Prayer schedule refresh failed.", {
        subscriptionId: id,
        error,
      });
    }
  }

  const dueMembers = await redis.zrange<string[]>(dueSet, "-inf", now, {
    byScore: true,
    offset: 0,
    count: 100,
  });
  let sent = 0;
  for (let index = 0; index < dueMembers.length; index += 20) {
    const results = await Promise.all(
      dueMembers
        .slice(index, index + 20)
        .map((member) => deliverPrayerAlert(redis, member, now)),
    );
    sent += results.filter(Boolean).length;
  }

  return { skipped: false, sent, processed: dueMembers.length };
}
