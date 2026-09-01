"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Language = "ar" | "en";

type Ayah = {
  numberInSurah: number;
  text: string;
  translationText: string;
  tafsirText?: string;
};

type SurahDetail = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
};

const copy = {
  ar: {
    back: "العودة للرئيسية",
    previous: "السابق",
    next: "التالي",
    verses: "آيات",
    translation: "الترجمة",
    tafsir: "التفسير",
    loading: "جارٍ تحميل السورة…",
    notFound: "تعذّر تحميل هذه السورة. جرّب أخرى.",
    unavailable: "السورة غير متاحة حاليًا.",
    language: "AR / EN",
    darkMode: "🌙 / ☀️",
  },
  en: {
    back: "Back to home",
    previous: "Previous",
    next: "Next",
    verses: "verses",
    translation: "Translation",
    tafsir: "Tafsir",
    loading: "Loading surah…",
    notFound: "This surah could not be loaded. Please try another one.",
    unavailable: "Surah not available.",
    language: "EN / AR",
    darkMode: "☀️ / 🌙",
  },
};

export default function SurahPage() {
  const params = useParams();
  const surahNumber = Number(params?.number ?? 1);

  const [language, setLanguage] = useState<Language>("ar");
  const [darkMode, setDarkMode] = useState(false);
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTafsir, setExpandedTafsir] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("quran-favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
    const savedDark = localStorage.getItem("quran-dark-mode");
    if (savedDark) {
      setDarkMode(JSON.parse(savedDark));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadSurah() {
      try {
        const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
        const englishResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
        const tafsirResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.muyassar`);

        if (!arabicResponse.ok || !englishResponse.ok) {
          throw new Error("Surah not found.");
        }

        const [arabicData, englishData, tafsirData] = await Promise.all([
          arabicResponse.json(),
          englishResponse.json(),
          tafsirResponse.ok ? tafsirResponse.json() : { data: { ayahs: [] } },
        ]);

        const arabic = arabicData.data;
        const english = englishData.data;
        const tafsir = tafsirData.data || {};

        const ayahs = (arabic.ayahs ?? []).map((ayah: any, index: number) => ({
          numberInSurah: Number(ayah.numberInSurah ?? index + 1),
          text: ayah.text ?? "",
          translationText: english.ayahs?.[index]?.text ?? "",
          tafsirText: tafsir.ayahs?.[index]?.text ?? "",
        }));

        setSurah({
          number: Number(arabic.number ?? surahNumber),
          name: arabic.name ?? "",
          englishName: arabic.englishName ?? "",
          englishNameTranslation: arabic.englishNameTranslation ?? "",
          numberOfAyahs: Number(arabic.numberOfAyahs ?? ayahs.length ?? 0),
          revelationType: arabic.revelationType ?? "",
          ayahs,
        });
      } catch {
        setError(language === "ar" ? copy.ar.notFound : copy.en.notFound);
      } finally {
        setIsLoading(false);
      }
    }

    loadSurah();
  }, [language, surahNumber]);

  const direction = language === "ar" ? "rtl" : "ltr";
  const currentText = copy[language];
  const prevSurah = useMemo(() => Math.max(1, surahNumber - 1), [surahNumber]);
  const nextSurah = useMemo(() => Math.min(114, surahNumber + 1), [surahNumber]);
  const isFavorite = favorites.includes(surahNumber);

  const toggleFavorite = () => {
    const next = isFavorite ? favorites.filter((item) => item !== surahNumber) : [...favorites, surahNumber];
    setFavorites(next);
    localStorage.setItem("quran-favorites", JSON.stringify(next));
  };

  const toggleTafsir = (ayahNumber: number) => {
    const next = new Set(expandedTafsir);
    if (next.has(ayahNumber)) {
      next.delete(ayahNumber);
    } else {
      next.add(ayahNumber);
    }
    setExpandedTafsir(next);
  };

  if (!mounted || isLoading) {
    return (
      <main dir={direction} className={`min-h-screen px-4 py-10 transition-colors duration-200 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
        <div className={`mx-auto max-w-5xl rounded-[24px] border p-10 text-center shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
          {currentText.loading}
        </div>
      </main>
    );
  }

  if (error || !surah) {
    return (
      <main dir={direction} className={`min-h-screen px-4 py-10 transition-colors duration-200 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"}`}>
        <div className={`mx-auto max-w-3xl rounded-[24px] border p-10 text-center shadow-sm transition-colors duration-200 ${darkMode ? "border-red-900 bg-red-950 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>
          {error || currentText.unavailable}
        </div>
      </main>
    );
  }

  return (
    <main dir={direction} className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-[radial-gradient(circle_at_top,_#f4efe6,_#f7f3ea_35%,_#f1f5f9_100%)] text-slate-900"}`}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
              {language === "ar" ? "←" : "←"} {currentText.back}
            </Link>
            <Link href={`/surah/${prevSurah}`} className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
              {currentText.previous}
            </Link>
            <Link href={`/surah/${nextSurah}`} className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200"}`}>
              {currentText.next}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setLanguage((prev) => (prev === "ar" ? "en" : "ar"))}
            className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
          >
            {currentText.language}
          </button>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"}`}
          >
            {currentText.darkMode}
          </button>
        </div>

        <section className={`mb-8 rounded-[28px] border p-7 text-white shadow-xl transition-colors duration-200 ${darkMode ? "border-slate-700 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-slate-900/40" : "border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 shadow-emerald-950/20"}`}>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-emerald-100"}`}>
                {language === "ar" ? "سورة" : "Surah"} {surah.number}
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-5xl">{surah.name}</h1>
              <p className={`mt-3 text-lg transition-colors duration-200 ${darkMode ? "text-slate-300" : "text-emerald-100"}`}>
                {surah.englishName} • {surah.englishNameTranslation}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className={`rounded-full border px-4 py-3 text-sm font-medium transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-700 text-slate-200" : "border-white/20 bg-white/10 text-emerald-50"}`}>
                {Number(surah.numberOfAyahs ?? 0).toLocaleString(language === "ar" ? "ar-EG" : "en-US")} {currentText.verses} • {surah.revelationType}
              </div>
              <button
                type="button"
                onClick={toggleFavorite}
                className={`rounded-full border px-4 py-3 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600" : "border-white/20 bg-white/10 hover:bg-white/15"}`}
              >
                {isFavorite ? "★ في المفضلة" : "☆ إضافة للمفضلة"}
              </button>
            </div>
          </div>
        </section>

        <section className={`mb-6 rounded-[24px] border p-6 shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className={`text-xl font-bold transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{language === "ar" ? "المسموعات" : "Recitation"}</h2>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${darkMode ? "bg-slate-700 text-slate-200" : "bg-emerald-100 text-emerald-800"}`}>
              {language === "ar" ? "استماع" : "Audio"}
            </span>
          </div>
          <audio controls className={`w-full accent-emerald-500 ${darkMode ? "bg-slate-700" : ""}`} src={`https://www.quranaudio.com/quran/${surahNumber}/ar_ar_alafasy_128.mp3`} />
        </section>

        <section className="space-y-6">
          {surah.ayahs.map((ayah) => (
            <article key={ayah.numberInSurah} className={`rounded-[24px] border p-6 shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
              <div className="mb-5 flex items-center justify-start">
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                  {surah.number}:{ayah.numberInSurah}
                </span>
              </div>

              <p className={`text-right text-4xl leading-[2.5] sm:text-5xl transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{ayah.text}</p>

              <div className={`mt-6 rounded-2xl p-6 transition-colors duration-200 ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                <p className={`mb-3 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{currentText.translation}</p>
                <p className={`text-base leading-8 transition-colors duration-200 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{ayah.translationText || "Translation not available."}</p>
              </div>

              {ayah.tafsirText && (
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => toggleTafsir(ayah.numberInSurah)}
                    className={`flex w-full items-center justify-between rounded-2xl px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                      expandedTafsir.has(ayah.numberInSurah)
                        ? darkMode
                          ? "bg-emerald-900/30 text-emerald-300"
                          : "bg-emerald-100 text-emerald-800"
                        : darkMode
                          ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className="uppercase tracking-widest">{currentText.tafsir}</span>
                    <span className={`text-lg transition-transform duration-200 ${expandedTafsir.has(ayah.numberInSurah) ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {expandedTafsir.has(ayah.numberInSurah) && (
                    <div className={`rounded-2xl p-6 transition-colors duration-200 ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                      <p className={`text-right text-base leading-8 transition-colors duration-200 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{ayah.tafsirText}</p>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
