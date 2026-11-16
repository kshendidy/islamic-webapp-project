"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Language = "ar" | "en";
type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
type LocationError = "denied" | "unavailable" | "timeout" | "unsupported";

type Position = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type PrayerDay = {
  timings: Record<PrayerKey, string>;
  date: {
    readable: string;
    hijri: {
      date: string;
      year: string;
      month: {
        en: string;
        ar: string;
      };
    };
  };
  meta: {
    timezone: string;
    method: {
      name: string;
    };
  };
};

type PrayerApiResponse = {
  code: number;
  data: PrayerDay;
};

const prayerKeys: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const prayerLabels: Record<PrayerKey, { ar: string; en: string }> = {
  Fajr: { ar: "الفجر", en: "Fajr" },
  Dhuhr: { ar: "الظهر", en: "Dhuhr" },
  Asr: { ar: "العصر", en: "Asr" },
  Maghrib: { ar: "المغرب", en: "Maghrib" },
  Isha: { ar: "العشاء", en: "Isha" },
};

const calculationMethods = [
  { id: 3, ar: "رابطة العالم الإسلامي", en: "Muslim World League" },
  { id: 4, ar: "أم القرى - مكة المكرمة", en: "Umm al-Qura, Makkah" },
  { id: 5, ar: "الهيئة المصرية العامة للمساحة", en: "Egyptian General Authority" },
  { id: 2, ar: "الجمعية الإسلامية لأمريكا الشمالية", en: "ISNA" },
  { id: 1, ar: "جامعة العلوم الإسلامية - كراتشي", en: "University of Islamic Sciences, Karachi" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPrayerApiResponse(value: unknown): value is PrayerApiResponse {
  if (!isRecord(value) || value.code !== 200 || !isRecord(value.data)) return false;
  const { timings, date, meta } = value.data;
  if (!isRecord(timings) || !isRecord(date) || !isRecord(meta)) return false;
  if (!isRecord(date.hijri) || !isRecord(date.hijri.month) || !isRecord(meta.method)) {
    return false;
  }

  return (
    prayerKeys.every((key) => typeof timings[key] === "string") &&
    typeof date.readable === "string" &&
    typeof date.hijri.date === "string" &&
    typeof date.hijri.year === "string" &&
    typeof date.hijri.month.en === "string" &&
    typeof date.hijri.month.ar === "string" &&
    typeof meta.timezone === "string" &&
    typeof meta.method.name === "string"
  );
}

function formatApiDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

function getMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatTime(time: string, locale: string) {
  const minutes = getMinutes(time);
  if (minutes === null) return time;
  const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getCurrentMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  return hour * 60 + minute;
}

async function fetchPrayerDay(
  position: Position,
  method: number,
  madhab: number,
  date: string,
  signal: AbortSignal,
): Promise<PrayerDay> {
  const url = new URL(`https://api.aladhan.com/v1/timings/${date}`);
  url.searchParams.set("latitude", String(position.latitude));
  url.searchParams.set("longitude", String(position.longitude));
  url.searchParams.set("method", String(method));
  url.searchParams.set("school", String(madhab));

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Prayer times returned ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (!isPrayerApiResponse(data)) {
    throw new Error("Prayer times response had an unexpected format.");
  }
  return data.data;
}

export default function PrayerTimesView() {
  const [language, setLanguage] = useState<Language>("ar");
  const [position, setPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<LocationError | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [method, setMethod] = useState(3);
  const [madhab, setMadhab] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [prayerResult, setPrayerResult] = useState<{
    key: string;
    data: PrayerDay;
  } | null>(null);
  const [prayerErrorKey, setPrayerErrorKey] = useState("");
  const isArabic = language === "ar";
  const locale = isArabic ? "ar-EG" : "en-US";
  const selectedMethod =
    calculationMethods.find((item) => item.id === method) ?? calculationMethods[0];
  const apiDate = formatApiDate(now);
  const requestKey = position
    ? `${position.latitude},${position.longitude}:${method}:${madhab}:${apiDate}:${retryCount}`
    : "";

  const handleLocationSuccess = useCallback((result: GeolocationPosition) => {
    setPosition({
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
      accuracy: result.coords.accuracy,
    });
    setLocationError(null);
    setIsLocating(false);
  }, []);

  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    const locationError: LocationError =
      error.code === error.PERMISSION_DENIED
        ? "denied"
        : error.code === error.POSITION_UNAVAILABLE
          ? "unavailable"
          : "timeout";
    setLocationError(locationError);
    setIsLocating(false);
  }, []);

  const requestLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("unsupported");
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 },
    );
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 },
      );
    }
  }, [handleLocationError, handleLocationSuccess]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!position) return;
    const controller = new AbortController();

    fetchPrayerDay(position, method, madhab, apiDate, controller.signal)
      .then((data) => {
        const key = `${position.latitude},${position.longitude}:${method}:${madhab}:${apiDate}:${retryCount}`;
        setPrayerResult({ key, data });
        setPrayerErrorKey("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const key = `${position.latitude},${position.longitude}:${method}:${madhab}:${apiDate}:${retryCount}`;
        setPrayerErrorKey(key);
      });

    return () => controller.abort();
  }, [apiDate, madhab, method, position, retryCount]);

  const prayerDay = prayerResult?.key === requestKey ? prayerResult.data : null;
  const isLoadingPrayerTimes =
    position !== null && prayerDay === null && prayerErrorKey !== requestKey;
  const nextPrayer = useMemo(() => {
    if (!prayerDay) return null;
    const currentMinutes = getCurrentMinutes(now, prayerDay.meta.timezone);
    return (
      prayerKeys.find((key) => {
        const prayerMinutes = getMinutes(prayerDay.timings[key]);
        return prayerMinutes !== null && prayerMinutes > currentMinutes;
      }) ?? "Fajr"
    );
  }, [now, prayerDay]);

  const locationErrorMessage = locationError
    ? {
        denied: isArabic
          ? "لم يُسمح بالوصول إلى موقعك. اسمح للموقع باستخدام الموقع الجغرافي ثم حاول مرة أخرى."
          : "Location access was denied. Allow location access for this site and try again.",
        unavailable: isArabic
          ? "تعذّر تحديد موقعك الحالي. تحقق من إعدادات الموقع وحاول مرة أخرى."
          : "Your location is unavailable. Check your location settings and try again.",
        timeout: isArabic
          ? "استغرق تحديد الموقع وقتًا طويلًا. حاول مرة أخرى."
          : "Finding your location timed out. Please try again.",
        unsupported: isArabic
          ? "المتصفح لا يدعم تحديد الموقع. جرّب متصفحًا آخر أو جهازًا يدعم الموقع."
          : "This browser does not support location. Try another browser or a location-enabled device.",
      }[locationError]
    : "";

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
      className="min-h-screen text-amber-950"
    >
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
          >
            {isArabic ? "العودة إلى الرئيسية" : "Back to home"}
          </Link>
          <button
            type="button"
            onClick={() => setLanguage(isArabic ? "en" : "ar")}
            className="rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isArabic ? "English" : "العربية"}
          </button>
        </nav>

        <header className="mb-7 overflow-hidden rounded-[30px] border border-amber-900/10 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 p-7 text-white shadow-xl shadow-amber-950/15 sm:p-10">
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-amber-200">
            {isArabic ? "حسب موقعك الحالي" : "Based on your current location"}
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {isArabic ? "مواقيت الصلاة" : "Prayer Times"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-amber-50 sm:text-lg">
            {isArabic
              ? "نطلب موقعك تلقائيًا لحساب مواقيت اليوم، وتتجدد المواقيت عند تغير التاريخ."
              : "We automatically request your location to calculate today’s prayer times. Times refresh when the date changes."}
          </p>
        </header>

        <aside className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-7 text-amber-950">
          {isArabic
            ? "تُرسل إحداثيات موقعك إلى خدمة AlAdhan لجلب المواقيت، ولا نحفظها على خادمنا. قد تختلف النتائج قليلًا حسب طريقة الحساب وإعدادات المسجد المحلي."
            : "Your coordinates are sent to AlAdhan to fetch prayer times; we do not store them on our server. Results may vary by calculation method and local mosque settings."}
        </aside>

        <section className="mb-6 rounded-[24px] border border-amber-900/10 bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                {isArabic ? "الموقع" : "Location"}
              </p>
              {position ? (
                <>
                  <p dir="ltr" className="mt-1 text-sm font-semibold text-slate-800">
                    {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                  </p>
                  {prayerDay && (
                    <p className="mt-1 text-sm text-slate-600">
                      {prayerDay.meta.timezone}
                      {" · "}
                      {isArabic ? "دقة" : "accuracy"}{" "}
                      {Math.round(position.accuracy).toLocaleString(locale)}{" "}
                      {isArabic ? "متر" : "m"}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm leading-7 text-slate-600">
                  {isArabic
                    ? "اسمح بالوصول إلى موقعك لعرض المواقيت تلقائيًا."
                    : "Allow location access to load your local prayer times."}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={requestLocation}
              disabled={isLocating}
              className="shrink-0 rounded-full bg-amber-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:cursor-wait disabled:opacity-60"
            >
              {isLocating
                ? isArabic
                  ? "جارٍ تحديد موقعك..."
                  : "Finding your location..."
                : position
                  ? isArabic
                    ? "تحديث الموقع"
                    : "Refresh location"
                  : isArabic
                    ? "استخدم موقعي"
                    : "Use my location"}
            </button>
          </div>
          {locationErrorMessage && (
            <p role="alert" className="mt-4 text-sm leading-7 text-red-800">
              {locationErrorMessage}
            </p>
          )}
        </section>

        {position && (
          <section className="mb-6 grid gap-4 rounded-[24px] border border-amber-900/10 bg-white/90 p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <label className="block text-sm font-bold text-amber-900" htmlFor="calculation-method">
              {isArabic ? "طريقة حساب المواقيت" : "Calculation method"}
              <select
                id="calculation-method"
                value={method}
                onChange={(event) => setMethod(Number(event.target.value))}
                className="mt-2 block w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-medium text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                {calculationMethods.map((item) => (
                  <option key={item.id} value={item.id}>
                    {isArabic ? item.ar : item.en}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-amber-900" htmlFor="asr-method">
              {isArabic ? "طريقة حساب العصر" : "Asr calculation"}
              <select
                id="asr-method"
                value={madhab}
                onChange={(event) => setMadhab(Number(event.target.value))}
                className="mt-2 block w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-medium text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
              >
                <option value={0}>
                  {isArabic ? "الجمهور (الشافعي والمالكي والحنبلي)" : "Standard (Shafi'i, Maliki, Hanbali)"}
                </option>
                <option value={1}>{isArabic ? "الحنفي" : "Hanafi"}</option>
              </select>
            </label>
          </section>
        )}

        {!position && !locationErrorMessage && (
          <p className="mb-6 rounded-2xl border border-amber-200 bg-white/85 p-5 text-center text-sm leading-7 text-slate-600" role="status">
            {isArabic
              ? "بانتظار إذن الموقع من المتصفح..."
              : "Waiting for your browser’s location permission..."}
          </p>
        )}

        {position && isLoadingPrayerTimes && (
          <p className="rounded-2xl border border-amber-200 bg-white/85 p-8 text-center text-slate-600" role="status">
            {isArabic ? "جارٍ تحميل مواقيت الصلاة..." : "Loading prayer times..."}
          </p>
        )}

        {position && prayerErrorKey === requestKey && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
            <p role="alert">
              {isArabic
                ? "تعذّر تحميل مواقيت الصلاة. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى."
                : "Could not load prayer times. Check your internet connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((current) => current + 1)}
              className="mt-4 rounded-full bg-red-800 px-5 py-2 font-semibold text-white hover:bg-red-700"
            >
              {isArabic ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        )}

        {prayerDay && (
          <>
            <section className="mb-5 overflow-hidden rounded-[28px] border border-amber-900/10 bg-white/90 shadow-sm">
              <div className="bg-amber-950 px-5 py-4 text-white sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-amber-200">
                      {prayerDay.date.readable}
                    </p>
                    <p className="mt-1 text-sm text-amber-50">
                      {prayerDay.date.hijri.date}{" "}
                      {isArabic
                        ? prayerDay.date.hijri.month.ar
                        : prayerDay.date.hijri.month.en}{" "}
                      {prayerDay.date.hijri.year}
                    </p>
                  </div>
                  <span className="text-xs text-amber-200">
                    {isArabic ? selectedMethod.ar : selectedMethod.en}
                  </span>
                </div>
              </div>

              {nextPrayer && (
                <div className="border-b border-amber-100 bg-amber-50/80 px-5 py-4 text-center sm:px-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    {isArabic ? "الصلاة القادمة" : "Next prayer"}
                  </p>
                  <p className="mt-1 text-xl font-black text-amber-950">
                    {isArabic ? prayerLabels[nextPrayer].ar : prayerLabels[nextPrayer].en}
                    {" · "}
                    {formatTime(prayerDay.timings[nextPrayer], locale)}
                  </p>
                </div>
              )}

              <div className="divide-y divide-amber-100">
                {prayerKeys.map((key) => {
                  const isNext = key === nextPrayer;
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between gap-4 px-5 py-4 sm:px-6 ${isNext ? "bg-amber-50/70" : "bg-white"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`h-2.5 w-2.5 rounded-full ${isNext ? "bg-amber-700" : "bg-amber-200"}`}
                        />
                        <span className="font-bold text-slate-800">
                          {isArabic ? prayerLabels[key].ar : prayerLabels[key].en}
                        </span>
                        {isNext && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                            {isArabic ? "القادمة" : "Next"}
                          </span>
                        )}
                      </div>
                      <time className="text-lg font-bold tabular-nums text-amber-950">
                        {formatTime(prayerDay.timings[key], locale)}
                      </time>
                    </div>
                  );
                })}
              </div>
            </section>

            <p className="text-center text-xs leading-6 text-slate-500">
              {isArabic ? "مصدر الحساب: " : "Times provided by "}
              <a
                href="https://aladhan.com/prayer-times-api"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                AlAdhan Prayer Times API
              </a>
              {" · "}
              {isArabic ? `المنطقة الزمنية: ${prayerDay.meta.timezone}` : `Time zone: ${prayerDay.meta.timezone}`}
            </p>
          </>
        )}

        <footer className="mt-10 border-t border-amber-900/10 py-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-semibold text-amber-800 underline underline-offset-2">
            {isArabic ? "العودة إلى مستكشف القرآن" : "Return to Quran Explorer"}
          </Link>
        </footer>
      </div>
    </main>
  );
}
