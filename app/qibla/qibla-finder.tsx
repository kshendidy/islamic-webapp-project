"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Language = "ar" | "en";

type Position = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type DeviceOrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const kaaba = { latitude: 21.4225, longitude: 39.8262 };
const directions = {
  ar: ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"],
  en: ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"],
};

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function getQiblaBearing(latitude: number, longitude: number) {
  const latitudeRadians = toRadians(latitude);
  const kaabaLatitudeRadians = toRadians(kaaba.latitude);
  const longitudeDifference = toRadians(kaaba.longitude - longitude);
  const y = Math.sin(longitudeDifference) * Math.cos(kaabaLatitudeRadians);
  const x =
    Math.cos(latitudeRadians) * Math.sin(kaabaLatitudeRadians) -
    Math.sin(latitudeRadians) *
      Math.cos(kaabaLatitudeRadians) *
      Math.cos(longitudeDifference);

  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

function getDirection(degrees: number, language: Language) {
  const index = Math.round(normalizeDegrees(degrees) / 45) % 8;
  return directions[language][index];
}

export default function QiblaFinder() {
  const [language, setLanguage] = useState<Language>("ar");
  const [position, setPosition] = useState<Position | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [compassError, setCompassError] = useState("");
  const isArabic = language === "ar";

  useEffect(() => {
    if (!isListening) return;

    const handleOrientation = (rawEvent: Event) => {
      const event = rawEvent as DeviceOrientationEventWithCompass;
      const degrees =
        typeof event.webkitCompassHeading === "number"
          ? event.webkitCompassHeading
          : event.absolute && typeof event.alpha === "number"
            ? 360 - event.alpha
            : null;

      if (degrees === null) return;
      const nextHeading = Math.round(normalizeDegrees(degrees));
      setHeading((current) => (current === nextHeading ? current : nextHeading));
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("deviceorientationabsolute", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
    };
  }, [isListening]);

  const requestLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(
        isArabic
          ? "المتصفح لا يدعم تحديد الموقع. جرّب متصفحًا آخر أو جهازًا يدعم الموقع."
          : "This browser does not support location. Try another browser or a location-enabled device.",
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: result.coords.accuracy,
        });
        setIsLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? isArabic
              ? "لم يُسمح بالوصول إلى موقعك. اسمح للموقع باستخدام الموقع الجغرافي ثم حاول مرة أخرى."
              : "Location access was denied. Allow location access for this site and try again."
            : error.code === error.POSITION_UNAVAILABLE
              ? isArabic
                ? "تعذّر تحديد موقعك الحالي. تحقق من إعدادات الموقع وحاول مرة أخرى."
                : "Your location is unavailable. Check your location settings and try again."
              : isArabic
                ? "استغرق تحديد الموقع وقتًا طويلًا. حاول مرة أخرى."
                : "Finding your location timed out. Please try again.";
        setLocationError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 },
    );
  };

  const toggleCompass = async () => {
    setCompassError("");
    if (isListening) {
      setIsListening(false);
      setHeading(null);
      return;
    }

    if (!("DeviceOrientationEvent" in window)) {
      setCompassError(
        isArabic
          ? "بوصلة الجهاز غير مدعومة في هذا المتصفح. استخدم زاوية القبلة الظاهرة أدناه."
          : "This browser does not support a device compass. Use the Qibla angle shown below.",
      );
      return;
    }

    try {
      const orientationConstructor =
        window.DeviceOrientationEvent as DeviceOrientationConstructor;
      if (orientationConstructor.requestPermission) {
        const permission = await orientationConstructor.requestPermission();
        if (permission !== "granted") {
          setCompassError(
            isArabic
              ? "لم يُسمح باستخدام بوصلة الجهاز."
              : "Permission to use the device compass was denied.",
          );
          return;
        }
      }

      setIsListening(true);
    } catch {
      setCompassError(
        isArabic
          ? "تعذّر تفعيل بوصلة الجهاز. استخدم زاوية القبلة الظاهرة أدناه."
          : "The device compass could not be enabled. Use the Qibla angle shown below.",
      );
    }
  };

  const bearing =
    position === null
      ? null
      : getQiblaBearing(position.latitude, position.longitude);
  const relativeBearing =
    bearing === null ? 0 : normalizeDegrees(bearing - (heading ?? 0));
  const locale = isArabic ? "ar-EG" : "en-US";

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
            {isArabic ? "دليل القبلة" : "Qibla direction"}
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {isArabic ? "اتجاه القبلة" : "Find the Qibla"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-amber-50 sm:text-lg">
            {isArabic
              ? "حدد موقعك لمعرفة اتجاه الكعبة، ثم فعّل بوصلة جهازك لتوجيه السهم."
              : "Find your location to calculate the direction to the Kaaba, then enable your device compass to guide the arrow."}
          </p>
        </header>

        <aside className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-7 text-amber-950">
          {isArabic
            ? "يُستخدم موقعك على جهازك لحساب الاتجاه فقط، ولا يُحفظ أو يُرسل إلى خادم."
            : "Your location is used on your device to calculate the direction only. It is not stored or sent to a server."}
        </aside>

        <section className="grid gap-6 rounded-[28px] border border-amber-900/10 bg-white/90 p-5 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-black text-amber-950">
              {isArabic ? "موقعك واتجاه القبلة" : "Your location and Qibla"}
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              {isArabic
                ? "اسمح بالوصول إلى موقعك لحساب الزاوية من مكانك الحالي إلى الكعبة المشرفة."
                : "Allow location access to calculate the bearing from your current position to the Kaaba."}
            </p>
            <button
              type="button"
              onClick={requestLocation}
              disabled={isLocating}
              className="mt-5 rounded-full bg-amber-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:cursor-wait disabled:opacity-60"
            >
              {isLocating
                ? isArabic
                  ? "جارٍ تحديد موقعك..."
                  : "Finding your location..."
                : position
                  ? isArabic
                    ? "تحديث موقعي"
                    : "Refresh my location"
                  : isArabic
                    ? "استخدم موقعي"
                    : "Use my location"}
            </button>
            {locationError && (
              <p role="alert" className="mt-4 text-sm leading-7 text-red-800">
                {locationError}
              </p>
            )}
            {position && (
              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                <p className="text-sm font-bold text-amber-950">
                  {isArabic ? "موقعك التقريبي" : "Approximate location"}
                </p>
                <p dir="ltr" className="mt-1 text-sm text-slate-700">
                  {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {isArabic
                    ? `دقة الموقع نحو ${Math.round(position.accuracy).toLocaleString(locale)} متر`
                    : `Location accuracy: about ${Math.round(position.accuracy).toLocaleString(locale)} meters`}
                </p>
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-xs">
            <div
              className="relative aspect-square w-full rounded-full border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 shadow-inner"
              role="img"
              aria-label={
                bearing === null
                  ? isArabic
                    ? "بوصلة القبلة. استخدم موقعك لعرض الاتجاه."
                    : "Qibla compass. Use your location to show the direction."
                  : isArabic
                    ? `اتجاه القبلة ${Math.round(bearing)} درجة`
                    : `Qibla direction ${Math.round(bearing)} degrees`
              }
            >
              <span className="absolute inset-x-0 top-3 z-10 text-center text-xs font-black text-slate-500">
                {isArabic ? "ش" : "N"}
              </span>
              <svg
                viewBox="0 0 200 200"
                aria-hidden="true"
                className="h-full w-full"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="#e7d7bd"
                  strokeWidth="2"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="71"
                  fill="none"
                  stroke="#f1e7d7"
                  strokeWidth="1"
                />
                {Array.from({ length: 16 }, (_, index) => (
                  <line
                    key={index}
                    x1="100"
                    y1="14"
                    x2="100"
                    y2={index % 2 === 0 ? "23" : "19"}
                    stroke="#a8a29e"
                    strokeWidth={index % 2 === 0 ? "2" : "1"}
                    transform={`rotate(${index * 22.5} 100 100)`}
                  />
                ))}
                {bearing !== null && (
                  <g transform={`rotate(${relativeBearing} 100 100)`}>
                    <line
                      x1="100"
                      y1="104"
                      x2="100"
                      y2="39"
                      stroke="#b45309"
                      strokeLinecap="round"
                      strokeWidth="6"
                    />
                    <path d="M100 25 L87 49 L100 43 L113 49 Z" fill="#b45309" />
                  </g>
                )}
                <circle cx="100" cy="100" r="8" fill="#78350f" />
              </svg>
            </div>
            {bearing !== null && (
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  {isArabic ? "اتجاه القبلة" : "Qibla bearing"}
                </p>
                <p className="mt-1 text-3xl font-black text-amber-900">
                  {Math.round(bearing).toLocaleString(locale)}°
                  <span className="ms-2 text-lg font-bold">
                    {getDirection(bearing, language)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {position && (
          <section className="mt-6 rounded-[24px] border border-amber-900/10 bg-white/90 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-amber-950">
                  {isArabic ? "بوصلة الجهاز" : "Device compass"}
                </h2>
                <p className="mt-1 text-sm leading-7 text-slate-600">
                  {heading !== null
                    ? isArabic
                      ? `اتجاه الهاتف: ${heading.toLocaleString(locale)}°`
                      : `Phone heading: ${heading.toLocaleString(locale)}°`
                    : isListening
                      ? isArabic
                        ? "حرّك الهاتف ببطء بشكل رقم ٨ لمعايرة البوصلة."
                        : "Slowly move your phone in a figure-eight to calibrate the compass."
                      : isArabic
                        ? "يمكنك استخدام زاوية القبلة يدويًا إذا لم تتوفر بوصلة."
                        : "You can use the Qibla bearing manually if a compass is unavailable."}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={isListening}
                onClick={() => void toggleCompass()}
                className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
              >
                {isListening
                  ? isArabic
                    ? "إيقاف البوصلة"
                    : "Stop compass"
                  : isArabic
                    ? "تفعيل البوصلة"
                    : "Enable compass"}
              </button>
            </div>
            {compassError && (
              <p role="alert" className="mt-3 text-sm leading-7 text-red-800">
                {compassError}
              </p>
            )}
          </section>
        )}

        <aside className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm leading-7 text-slate-600">
          {isArabic
            ? "لأفضل نتيجة، أبعد الهاتف عن الأجسام المعدنية ومصادر المجال المغناطيسي. قد تختلف قراءة البوصلة قليلًا بحسب الجهاز وموقعك."
            : "For best results, keep your phone away from metal objects and magnetic sources. Compass readings may vary slightly by device and location."}
        </aside>

        <footer className="mt-10 border-t border-amber-900/10 py-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-semibold text-amber-800 underline underline-offset-2">
            {isArabic ? "العودة إلى مستكشف القرآن" : "Return to Quran Explorer"}
          </Link>
        </footer>
      </div>
    </main>
  );
}
