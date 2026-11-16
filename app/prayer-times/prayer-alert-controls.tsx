"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PrayerName } from "@/lib/prayer-alerts";

type Position = {
  latitude: number;
  longitude: number;
};

type Language = "ar" | "en";

type Props = {
  position: Position;
  timings: Record<PrayerName, string>;
  timezone: string;
  method: number;
  school: number;
  language: Language;
};

const prayerLabels: Record<PrayerName, { ar: string; en: string }> = {
  Fajr: { ar: "الفجر", en: "Fajr" },
  Dhuhr: { ar: "الظهر", en: "Dhuhr" },
  Asr: { ar: "العصر", en: "Asr" },
  Maghrib: { ar: "المغرب", en: "Maghrib" },
  Isha: { ar: "العشاء", en: "Isha" },
};

const prayerKeys: PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const consentKey = "prayer-alert-location-consent";

function urlBase64ToArrayBuffer(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const bytes = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    bytes[index] = rawData.charCodeAt(index);
  }
  return bytes.buffer;
}

function getMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function getLocalDateTime(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
}

export default function PrayerAlertControls({
  position,
  timings,
  timezone,
  method,
  school,
  language,
}: Props) {
  const isArabic = language === "ar";
  const [isPushSupported, setIsPushSupported] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [vapidPublicKey, setVapidPublicKey] = useState("");
  const [hasLocationConsent, setHasLocationConsent] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [syncedSignature, setSyncedSignature] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [audioMessage, setAudioMessage] = useState("");
  const [alertPrayer, setAlertPrayer] = useState<PrayerName | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastCheckRef = useRef<{ date: string; minutes: number; checkedAt: number } | null>(null);

  const settingsSignature = JSON.stringify({
    latitude: Number(position.latitude.toFixed(3)),
    longitude: Number(position.longitude.toFixed(3)),
    method,
    school,
    language,
  });
  const isScheduleSynced = Boolean(
    subscription && syncedSignature === settingsSignature,
  );

  const saveSubscription = useCallback(
    async (pushSubscription: PushSubscription) => {
      const response = await fetch("/api/prayer-alerts/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: pushSubscription.toJSON(),
          latitude: Number(position.latitude.toFixed(3)),
          longitude: Number(position.longitude.toFixed(3)),
          method,
          school,
          language,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : isArabic
              ? "تعذّر حفظ إعدادات الإشعارات."
              : "Could not save notification settings.";
        throw new Error(message);
      }
      setSyncedSignature(settingsSignature);
      setPushError("");
      setPushMessage(
        isArabic
          ? "تم تفعيل الإشعارات؛ ستصلك حتى عند إغلاق الصفحة."
          : "Notifications are enabled and can arrive when the page is closed.",
      );
    },
    [isArabic, language, method, position.latitude, position.longitude, school, settingsSignature],
  );

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setIsPushSupported(
        window.isSecureContext &&
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window,
      );
      setHasLocationConsent(
        window.localStorage.getItem(consentKey) === "true",
      );
    }, 0);

    void fetch("/api/prayer-alerts/vapid-key")
      .then(async (response) => {
        const result: unknown = await response.json();
        if (
          !response.ok ||
          typeof result !== "object" ||
          result === null ||
          !("publicKey" in result) ||
          typeof result.publicKey !== "string"
        ) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : isArabic
                ? "إعدادات الإشعارات غير مكتملة."
                : "Notification setup is incomplete.";
          throw new Error(message);
        }
        if (active) {
          setVapidPublicKey(result.publicKey);
          setPushError("");
        }
      })
      .catch((error: unknown) => {
        const setupMissing =
          error instanceof Error &&
          error.message === "Prayer notifications are not configured yet.";
        if (!setupMissing) {
          console.error("Prayer notification setup is unavailable.", error);
        }
        if (active) {
          setPushError(
            setupMissing && isArabic
              ? "إشعارات الصلاة غير مُهيأة على الخادم بعد."
              : error instanceof Error
              ? error.message
              : isArabic
                ? "إعدادات الإشعارات غير مكتملة."
                : "Notification setup is incomplete.",
          );
        }
      });

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .getRegistration("/")
        .then((registration) => registration?.pushManager.getSubscription() ?? null)
        .then((existing) => {
          if (active) setSubscription(existing);
        })
        .catch((error: unknown) => {
          console.error("Could not read the browser push subscription.", error);
          if (active) {
            setPushError(
              isArabic
                ? "تعذّر فحص إعدادات الإشعارات في هذا المتصفح."
                : "Could not check this browser’s notification settings.",
            );
          }
        });
    }

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [isArabic]);

  useEffect(() => {
    if (!subscription || !hasLocationConsent || syncedSignature === settingsSignature) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setPushBusy(true);
      void saveSubscription(subscription)
        .catch((error: unknown) => {
          if (active) {
            setPushError(
              error instanceof Error
                ? error.message
                : isArabic
                  ? "تعذّر تحديث جدول الإشعارات."
                  : "Could not update the notification schedule.",
            );
          }
        })
        .finally(() => {
          if (active) setPushBusy(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [hasLocationConsent, isArabic, saveSubscription, settingsSignature, subscription, syncedSignature]);

  useEffect(() => {
    if (!audioEnabled) return;

    const interval = window.setInterval(() => {
      const now = new Date();
      const current = getLocalDateTime(now, timezone);
      const previous = lastCheckRef.current;
      lastCheckRef.current = { ...current, checkedAt: now.getTime() };
      if (
        !previous ||
        previous.date !== current.date ||
        now.getTime() - previous.checkedAt > 90_000 ||
        current.minutes <= previous.minutes
      ) {
        return;
      }

      const prayer = prayerKeys.find((key) => {
        const prayerMinutes = getMinutes(timings[key]);
        return (
          prayerMinutes !== null &&
          previous.minutes < prayerMinutes &&
          current.minutes >= prayerMinutes
        );
      });
      if (!prayer) return;

      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      setAlertPrayer(prayer);
      setAudioMessage(isArabic ? "حان الآن وقت صلاة" : "It is now time for");
      void audio.play().catch((error: unknown) => {
        console.error("Adhan audio playback was blocked.", error);
        setAudioError(
          isArabic
            ? "منع المتصفح تشغيل الأذان تلقائيًا. اضغط «تفعيل الأذان» للسماح بالصوت."
            : "The browser blocked automatic audio. Select “Enable Adhan” to allow playback.",
        );
      });
    }, 5_000);

    return () => window.clearInterval(interval);
  }, [audioEnabled, isArabic, timings, timezone]);

  async function enablePush() {
    setPushBusy(true);
    setPushError("");
    setPushMessage("");
    try {
      if (!hasLocationConsent) {
        throw new Error(
          isArabic
            ? "يرجى الموافقة على حفظ موقعك وجدول الصلاة أولًا."
            : "Please consent to storing your location and prayer schedule first.",
        );
      }
      if (!window.isSecureContext || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error(
          isArabic
            ? "الإشعارات غير مدعومة في هذا المتصفح أو الاتصال."
            : "Push notifications are not supported by this browser or connection.",
        );
      }
      if (
        /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
        !window.matchMedia("(display-mode: standalone)").matches
      ) {
        throw new Error(
          isArabic
            ? "على iPhone وiPad، أضف الموقع إلى الشاشة الرئيسية لتفعيل الإشعارات."
            : "On iPhone and iPad, add this site to the Home Screen to enable push notifications.",
        );
      }
      if (Notification.permission === "denied") {
        throw new Error(
          isArabic
            ? "إذن الإشعارات مرفوض. غيّر الإذن من إعدادات المتصفح."
            : "Notifications are blocked. Change the permission in your browser settings.",
        );
      }

      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error(
          isArabic
            ? "لم يتم منح إذن الإشعارات."
            : "Notification permission was not granted.",
        );
      }

      if (!vapidPublicKey) {
        throw new Error(
          isArabic
            ? "إعدادات الإشعارات غير مكتملة على الخادم."
            : "Notification setup is incomplete on the server.",
        );
      }

      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const existing = await registration.pushManager.getSubscription();
      const nextSubscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToArrayBuffer(vapidPublicKey),
        }));

      await saveSubscription(nextSubscription);
      setSubscription(nextSubscription);
      setHasLocationConsent(true);
      window.localStorage.setItem(consentKey, "true");
    } catch (error) {
      setPushError(
        error instanceof Error
          ? error.message
          : isArabic
            ? "تعذّر تفعيل الإشعارات."
            : "Could not enable notifications.",
      );
    } finally {
      setPushBusy(false);
    }
  }

  async function updatePushSchedule() {
    if (!subscription || !hasLocationConsent) return;
    setPushBusy(true);
    setPushError("");
    try {
      await saveSubscription(subscription);
    } catch (error) {
      setPushError(
        error instanceof Error
          ? error.message
          : isArabic
            ? "تعذّر تحديث جدول الإشعارات."
            : "Could not update the notification schedule.",
      );
    } finally {
      setPushBusy(false);
    }
  }

  async function removePush() {
    if (!subscription) return;
    setPushBusy(true);
    setPushError("");
    try {
      const response = await fetch("/api/prayer-alerts/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : isArabic
              ? "تعذّر حذف الإشعارات المحفوظة."
              : "Could not remove the saved notifications.";
        throw new Error(message);
      }
      await subscription.unsubscribe();
      setSubscription(null);
      setSyncedSignature("");
      setHasLocationConsent(false);
      setPushMessage("");
      window.localStorage.removeItem(consentKey);
    } catch (error) {
      setPushError(
        error instanceof Error
          ? error.message
          : isArabic
            ? "تعذّر إيقاف الإشعارات."
            : "Could not disable notifications.",
      );
    } finally {
      setPushBusy(false);
    }
  }

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioEnabled) {
      audio.pause();
      setAudioEnabled(false);
      setAudioPlaying(false);
      setAudioMessage("");
      setAlertPrayer(null);
      return;
    }

    setAudioError("");
    try {
      audio.currentTime = 0;
      await audio.play();
      setAudioEnabled(true);
      setAudioMessage(
        isArabic
          ? "تم تفعيل الأذان؛ اترك الصفحة مفتوحة لتشغيله عند دخول وقت الصلاة."
          : "Adhan is enabled; keep this page open for it to play at prayer time.",
      );
      lastCheckRef.current = {
        ...getLocalDateTime(new Date(), timezone),
        checkedAt: Date.now(),
      };
    } catch (error) {
      console.error("Adhan audio could not be played.", error);
      setAudioError(
        isArabic
          ? "تعذّر تشغيل ملف الأذان. تحقق من اتصالك ثم حاول مرة أخرى."
          : "Could not play the Adhan audio. Check your connection and try again.",
      );
    }
  }

  return (
    <section className="mb-6 rounded-[24px] border border-amber-900/10 bg-white/90 p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-amber-950">
        {isArabic ? "تنبيهات الصلاة والأذان" : "Prayer alerts and Adhan"}
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        {isArabic
          ? "تصل إشعارات المتصفح حتى عند إغلاق الصفحة. صوت الأذان يعمل فقط ما دامت الصفحة مفتوحة، ويحتاج إلى تفعيل يدوي."
          : "Browser notifications can arrive when the page is closed. Adhan audio plays only while this page is open and must be enabled manually."}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <h3 className="font-bold text-amber-950">
            {isArabic ? "إشعارات المتصفح" : "Browser notifications"}
          </h3>
          {subscription && (
            <p className="mt-2 text-sm leading-6 text-emerald-800" role="status">
              {!hasLocationConsent
                ? isArabic
                  ? "أعد الموافقة على حفظ الموقع لتحديث جدول هذا الاشتراك."
                  : "Consent to location storage again to update this subscription’s schedule."
                : pushBusy
                  ? isArabic
                    ? "جارٍ تحديث جدول الصلاة..."
                    : "Updating the prayer schedule..."
                  : isScheduleSynced
                    ? isArabic
                      ? "الإشعارات مفعّلة لهذا الجهاز."
                      : "Notifications are enabled for this device."
                    : isArabic
                      ? "يحتاج جدول الإشعارات إلى تحديث."
                      : "The notification schedule needs updating."}
            </p>
          )}
          {(!subscription || !hasLocationConsent) && (
            <label className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-700">
              <input
                type="checkbox"
                checked={hasLocationConsent}
                onChange={(event) => {
                  setHasLocationConsent(event.target.checked);
                  if (event.target.checked) {
                    window.localStorage.setItem(consentKey, "true");
                  } else {
                    window.localStorage.removeItem(consentKey);
                  }
                }}
                className="mt-1 accent-amber-800"
              />
              <span>
                {isArabic
                  ? "أوافق على حفظ إحداثيات موقعي بعد تقريبها وجدول الصلاة واشتراك الإشعارات في Upstash لإرسال التنبيهات. يمكنني حذفها بإيقاف الإشعارات."
                  : "I agree to store my rounded coordinates, prayer schedule, and notification subscription in Upstash to send alerts. I can remove them by disabling notifications."}
              </span>
            </label>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {subscription ? (
              <>
                <button
                  type="button"
                  onClick={() => void updatePushSchedule()}
                  disabled={pushBusy || !hasLocationConsent || isScheduleSynced}
                  className="rounded-full border border-amber-300 px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isArabic ? "تحديث الجدول" : "Update schedule"}
                </button>
                <button
                  type="button"
                  onClick={() => void removePush()}
                  disabled={pushBusy}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-50 disabled:opacity-50"
                >
                  {isArabic ? "إيقاف الإشعارات" : "Disable notifications"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void enablePush()}
                disabled={
                  pushBusy ||
                  !hasLocationConsent ||
                  !vapidPublicKey ||
                  isPushSupported === false
                }
                className="rounded-full bg-amber-800 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pushBusy
                  ? isArabic
                    ? "جارٍ التفعيل..."
                    : "Enabling..."
                  : isArabic
                    ? "تفعيل الإشعارات"
                    : "Enable notifications"}
              </button>
            )}
          </div>
          {isPushSupported === false && (
            <p className="mt-3 text-sm text-red-800" role="alert">
              {isArabic
                ? "هذا المتصفح أو الاتصال لا يدعم إشعارات الدفع."
                : "This browser or connection does not support push notifications."}
            </p>
          )}
          {pushError && (
            <p className="mt-3 text-sm leading-6 text-red-800" role="alert">
              {pushError}
            </p>
          )}
          {pushMessage && (
            <p className="mt-3 text-sm leading-6 text-emerald-800" role="status">
              {pushMessage}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <h3 className="font-bold text-amber-950">
            {isArabic ? "صوت الأذان" : "Adhan audio"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {isArabic
              ? "اضغط للتجربة والتفعيل. يحتاج الصوت إلى بقاء الصفحة مفتوحة؛ الإشعارات عند إغلاقها تستخدم صوت الجهاز المعتاد."
              : "Select to test and enable it. The page must remain open for audio; closed-page notifications use the device’s usual notification sound."}
          </p>
          <button
            type="button"
            onClick={() => void toggleAudio()}
            className="mt-4 rounded-full bg-amber-800 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
          >
            {audioEnabled
              ? isArabic
                ? "إيقاف الأذان"
                : "Disable Adhan"
              : isArabic
                ? "تجربة الأذان وتفعيله"
                : "Test and enable Adhan"}
          </button>
          {audioMessage && (
            <p className="mt-3 text-sm leading-6 text-emerald-800" role="status">
              {alertPrayer
                ? `${audioMessage} ${isArabic ? prayerLabels[alertPrayer].ar : prayerLabels[alertPrayer].en}.`
                : audioMessage}
            </p>
          )}
          {audioError && (
            <p className="mt-3 text-sm leading-6 text-red-800" role="alert">
              {audioError}
            </p>
          )}
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {isArabic ? "التسجيل: " : "Recording: "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Adhan.ogg"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Aishatu98 · Wikimedia Commons · CC0 1.0
            </a>
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src="/audio/adhan.mp3"
        preload="auto"
        className="sr-only"
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onEnded={() => setAudioPlaying(false)}
      />
      <span className="sr-only" aria-live="polite">
        {audioPlaying ? (isArabic ? "الأذان يعمل" : "Adhan is playing") : ""}
      </span>
    </section>
  );
}
