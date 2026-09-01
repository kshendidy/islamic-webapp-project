"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Language = "ar" | "en";

type Ayah = {
  numberInSurah: number;
  text: string;
  arabicText: string;
  translationText: string;
};

type Surah = {
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
    title: "مستكشف القرآن",
    subtitle: "مرجع إسلامي",
    surahs: "سور",
    verses: "آيات",
    visibleSurahs: "السور الظاهرة",
    totalVerses: "إجمالي الآيات",
    featuredTopic: "الموضوع المميز",
    searchPlaceholder: "ابحث عن سورة أو كلمة أو الآية",
    allSurahs: "كل السور",
    featuredSurah: "السورة المميزة",
    openSurah: "فتح السورة",
    loading: "جارٍ تحميل كامل المصحف…",
    noMatches: "لا توجد نتائج مطابقة للبحث.",
    noMatchesHint: "جرّب كلمة أخرى أو اختر سورة مختلفة.",
    language: "AR / EN",
    darkMode: "🌙 / ☀️",
    home: "العودة للرئيسية",
    previous: "السابق",
    next: "التالي",
    translation: "الترجمة",
    verse: "آية",
    versesText: "آيات",
    reading: "قراءة",
    by: "بواسطة",
  },
  en: {
    title: "Quran Explorer",
    subtitle: "Islamic reference",
    surahs: "surahs",
    verses: "verses",
    visibleSurahs: "Visible surahs",
    totalVerses: "Total verses",
    featuredTopic: "Featured topic",
    searchPlaceholder: "Search by surah, keyword, or verse text",
    allSurahs: "All surahs",
    featuredSurah: "Featured surah",
    openSurah: "Open surah",
    loading: "Loading the full Quran…",
    noMatches: "No surahs matched your search.",
    noMatchesHint: "Try another keyword or select a different surah.",
    language: "EN / AR",
    darkMode: "☀️ / 🌙",
    home: "Back to home",
    previous: "Previous",
    next: "Next",
    translation: "Translation",
    verse: "Verse",
    versesText: "verses",
    reading: "Reading",
    by: "by",
  },
};

const staticFeatured = [
  { en: "guidance", ar: "الهداية" },
  { en: "mercy", ar: "الرحمة" },
  { en: "faith", ar: "الإيمان" },
  { en: "justice", ar: "العدل" },
  { en: "hope", ar: "الأمل" },
  { en: "peace", ar: "السلام" },
  { en: "knowledge", ar: "العلم" },
  { en: "purpose", ar: "الغاية" },
  { en: "gratitude", ar: "الشكر" },
  { en: "truth", ar: "الحقيقة" },
];

const normalizeSurah = (surah: any): Surah => ({
  number: Number(surah.number ?? 0),
  name: surah.name ?? "",
  englishName: surah.englishName ?? "",
  englishNameTranslation: surah.englishNameTranslation ?? "",
  numberOfAyahs: Number(surah.numberOfAyahs ?? surah.ayahs?.length ?? 0),
  revelationType: surah.revelationType ?? "",
  ayahs: (surah.ayahs ?? []).map((ayah: any, index: number) => ({
    numberInSurah: Number(ayah.numberInSurah ?? index + 1),
    text: ayah.text ?? "",
    arabicText: ayah.text ?? "",
    translationText: ayah.translationText ?? "",
  })),
});

export default function Home() {
  const [language, setLanguage] = useState<Language>("ar");
  const [darkMode, setDarkMode] = useState(false);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState(copy.ar.allSurahs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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
    const savedLanguage = localStorage.getItem("quran-language");
    if (savedLanguage) {
      setLanguage(JSON.parse(savedLanguage));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("quran-language", JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    setSelectedSurah(copy[language].allSurahs);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("quran-dark-mode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    Promise.all([
      fetch("https://api.alquran.cloud/v1/quran/ar.alafasy"),
      fetch("https://api.alquran.cloud/v1/quran/en.asad"),
    ])
      .then(async ([arabicResponse, englishResponse]) => {
        if (!arabicResponse.ok || !englishResponse.ok) {
          throw new Error("Unable to load the Quran data right now.");
        }

        const [arabicData, englishData] = await Promise.all([
          arabicResponse.json(),
          englishResponse.json(),
        ]);

        const arabicSurahs = arabicData.data?.surahs ?? [];
        const englishSurahs = englishData.data?.surahs ?? [];

        const combined = arabicSurahs.map((surah: any) => {
          const english = englishSurahs.find((item: any) => item.number === surah.number) ?? { ayahs: [] };
          const normalizedSurah = normalizeSurah(surah);

          return {
            ...normalizedSurah,
            ayahs: normalizedSurah.ayahs.map((ayah, index) => ({
              ...ayah,
              translationText: english.ayahs?.[index]?.text ?? "",
            })),
          } satisfies Surah;
        });

        setSurahs(combined);
      })
      .catch(() => {
        setError(language === "ar" ? "تعذّر الوصول إلى بيانات القرآن الآن." : "The Quran API could not be reached. Please try again shortly.");
      })
      .finally(() => setIsLoading(false));
  }, [language]);

  const locale = language === "ar" ? "ar-EG" : "en-US";
  const currentText = copy[language];
  const direction = language === "ar" ? "rtl" : "ltr";
  const readingProgress = (() => {
    if (typeof window === "undefined") return {} as Record<number, number>;
    try {
      const raw = localStorage.getItem("quran-reading-progress");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {} as Record<number, number>;
    }
  })();

  const surahOptions = [currentText.allSurahs, ...surahs.map((surah) => surah.name)];

  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      const matchesSurah = selectedSurah === currentText.allSurahs || surah.name === selectedSurah;
      const queryValue = query.trim().toLowerCase();

      const matchesQuery =
        queryValue.length === 0 ||
        surah.name.toLowerCase().includes(queryValue) ||
        surah.englishName.toLowerCase().includes(queryValue) ||
        surah.englishNameTranslation.toLowerCase().includes(queryValue) ||
        surah.ayahs.some((ayah) => {
          const haystack = `${ayah.arabicText} ${ayah.translationText}`.toLowerCase();
          return haystack.includes(queryValue);
        });

      return matchesSurah && matchesQuery;
    });
  }, [query, selectedSurah, currentText.allSurahs, surahs]);

  const totalVerses = useMemo(
    () => surahs.reduce((sum, surah) => sum + Number(surah.numberOfAyahs ?? surah.ayahs?.length ?? 0), 0),
    [surahs],
  );
  const featuredSurah = filteredSurahs[0] ?? surahs[0];
  const favoriteSurahs = surahs.filter((surah) => favorites.includes(surah.number));

  const toggleFavorite = (number: number) => {
    const next = favorites.includes(number)
      ? favorites.filter((item) => item !== number)
      : [...favorites, number];

    setFavorites(next);
    localStorage.setItem("quran-favorites", JSON.stringify(next));
  };

  return (
    <main dir={direction} className={`min-h-screen text-slate-900 transition-colors duration-200 bg-transparent ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className={`mb-8 rounded-[28px] border shadow-lg backdrop-blur-sm transition-colors duration-200 p-7 ${darkMode ? "border-slate-700 bg-slate-800/70 shadow-slate-900/20" : "border-emerald-900/10 bg-white/70 shadow-emerald-950/5"}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={`mb-2 text-sm font-medium uppercase tracking-[0.28em] transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-emerald-700"}`}>
                {currentText.subtitle}
              </p>
              <h1 className={`text-4xl font-black tracking-tight sm:text-5xl transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                {currentText.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <button
                type="button"
                onClick={() => setLanguage((prev) => (prev === "ar" ? "en" : "ar"))}
                className={`rounded-full border px-4 py-2 font-medium transition ${darkMode ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`}
              >
                {currentText.language}
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`rounded-full border px-4 py-2 font-medium transition ${darkMode ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"}`}
              >
                {currentText.darkMode}
              </button>
              <span className={`rounded-full border px-3 py-1.5 font-medium transition ${darkMode ? "border-slate-600 bg-slate-700 text-slate-200" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                {surahs.length.toLocaleString(locale)} {currentText.surahs}
              </span>
              <span className={`rounded-full border px-3 py-1.5 font-medium transition ${darkMode ? "border-slate-600 bg-slate-700 text-slate-200" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {Number(totalVerses).toLocaleString(locale)} {currentText.verses}
              </span>
              <span className={`rounded-full border px-3 py-1.5 font-medium transition ${darkMode ? "border-slate-600 bg-slate-700 text-slate-200" : "border-violet-200 bg-violet-50 text-violet-800"}`}>
                {favoriteSurahs.length} مفضلة
              </span>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{currentText.visibleSurahs}</p>
            <p className={`mt-3 text-4xl font-bold transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{filteredSurahs.length}</p>
          </div>
          <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{currentText.totalVerses}</p>
            <p className={`mt-3 text-4xl font-bold transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{Number(totalVerses).toLocaleString(locale)}</p>
          </div>
          <div className={`rounded-2xl border p-6 shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{currentText.featuredTopic}</p>
            <p className={`mt-3 text-lg font-bold transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
              {featuredSurah 
                ? (language === "ar" 
                    ? staticFeatured[(featuredSurah.number - 1) % staticFeatured.length]?.ar
                    : staticFeatured[(featuredSurah.number - 1) % staticFeatured.length]?.en)
                : (language === "ar" ? "الهداية" : "Guidance")}
            </p>
          </div>
        </section>

        <section className={`mb-8 rounded-[28px] border p-6 shadow-lg backdrop-blur-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800/80 shadow-slate-900/30" : "border-slate-200 bg-white/80 shadow-slate-200/60"}`}>
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
            <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-700 focus-within:border-blue-500 focus-within:ring-blue-900" : "border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:ring-emerald-100"} focus-within:ring-2`}>
              <span className="text-xl">🔎</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={currentText.searchPlaceholder}
                className={`w-full border-0 bg-transparent text-base placeholder:text-slate-400 focus:outline-none transition-colors duration-200 ${darkMode ? "text-slate-100 placeholder:text-slate-500" : "text-slate-800"}`}
              />
            </label>

            <select
              value={selectedSurah}
              onChange={(event) => setSelectedSurah(event.target.value)}
              className={`rounded-2xl border px-4 py-3.5 text-base transition-colors duration-200 focus:border-emerald-400 focus:outline-none ${darkMode ? "border-slate-600 bg-slate-700 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-800"}`}
            >
              {surahOptions.map((surah) => (
                <option key={surah} value={surah}>
                  {surah}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error ? (
          <div className={`mb-8 rounded-[28px] border p-5 transition-colors duration-200 ${darkMode ? "border-red-900 bg-red-950 text-red-200" : "border-red-200 bg-red-50 text-red-700"}`}>{error}</div>
        ) : null}

        {favoriteSurahs.length > 0 ? (
          <section className={`mb-8 rounded-[28px] border p-6 shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800" : "border-violet-200 bg-violet-50"}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-violet-900"}`}>السور المفضلة</h2>
              <span className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors duration-200 ${darkMode ? "bg-slate-700 text-slate-200" : "bg-violet-200 text-violet-900"}`}>
                {favoriteSurahs.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {favoriteSurahs.map((surah) => (
                <Link key={surah.number} href={`/surah/${surah.number}`} className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-violet-200 bg-white text-violet-800 hover:bg-violet-100"}`}>
                  {surah.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {featuredSurah && !isLoading ? (
          <section className={`mb-8 rounded-[28px] border p-7 text-white shadow-xl transition-colors duration-200 ${darkMode ? "border-slate-700 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-slate-900/40" : "border-emerald-200 bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 shadow-emerald-950/20"}`}>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={`mb-2 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-emerald-100"}`}>{currentText.featuredSurah}</p>
                <h2 className="text-3xl font-bold md:text-4xl">{featuredSurah.name}</h2>
                <p className={`mt-3 text-lg transition-colors duration-200 ${darkMode ? "text-slate-300" : "text-emerald-100"}`}>
                  {featuredSurah.englishName} • {Number(featuredSurah.numberOfAyahs ?? 0).toLocaleString(locale)} {currentText.versesText}
                </p>
              </div>
              <Link
                href={`/surah/${featuredSurah.number}`}
                className={`rounded-full border px-6 py-3 text-base font-medium transition-all duration-200 whitespace-nowrap ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600" : "border-white/20 bg-white/10 hover:bg-white/15"}`}
              >
                {currentText.openSurah}
              </Link>
            </div>

            <p className="mt-7 text-right text-4xl leading-[2.5] font-medium sm:text-5xl">
              {featuredSurah.ayahs[0]?.arabicText ?? ""}
            </p>

            <div className={`mt-7 rounded-2xl border p-6 transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-800/50" : "border-white/15 bg-black/10"}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-emerald-100"}`}>{currentText.translation}</p>
              <p className="mt-4 text-lg leading-8">{featuredSurah.ayahs[0]?.translationText ?? ""}</p>
            </div>
          </section>
        ) : null}

        {isLoading ? (
          <div className={`rounded-[24px] border p-10 text-center shadow-sm transition-colors duration-200 ${darkMode ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-200 bg-white text-slate-600"}`}>
            {currentText.loading}
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah) => (
                <div key={surah.number} className={`group rounded-[24px] border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 ${darkMode ? "border-slate-700 bg-slate-800 hover:border-slate-600 hover:shadow-slate-900/50" : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-lg"}`}>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className={`text-xs font-semibold uppercase tracking-[0.3em] transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-emerald-700"}`}>{surah.number}</p>
                      <h3 className={`mt-2 text-2xl font-bold leading-tight transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{surah.name}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          toggleFavorite(surah.number);
                        }}
                        className={`rounded-full border px-3 py-2 text-lg transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600" : "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100"}`}
                        aria-label={favorites.includes(surah.number) ? "Remove from favorites" : "Add to favorites"}
                      >
                        {favorites.includes(surah.number) ? "★" : "☆"}
                      </button>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 ${darkMode ? "border-slate-600 bg-slate-700 text-slate-300" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                        {Number(surah.numberOfAyahs ?? 0).toLocaleString(locale)}
                      </span>
                    </div>
                  </div>

                  <Link href={`/surah/${surah.number}`} className="block">
                    <p className={`text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{surah.englishName}</p>
                    <p className={`mt-1 text-sm transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{surah.englishNameTranslation}</p>
                    <p className={`mt-4 text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{surah.revelationType}</p>

                    {Number(readingProgress[surah.number] ?? 0) > 0 && (
                      <div className={`mt-4 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${darkMode ? "border-emerald-700 bg-emerald-900/30 text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                        📍 {language === "ar" ? `استئناف ${Number(readingProgress[surah.number] ?? 0) + 1}` : `Resume ${Number(readingProgress[surah.number] ?? 0) + 1}`}
                      </div>
                    )}

                    <p className={`mt-5 text-right text-3xl leading-relaxed transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
                      {surah.ayahs[0]?.arabicText ?? ""}
                    </p>

                    <p className={`mt-5 text-sm leading-7 transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{surah.ayahs[0]?.translationText ?? ""}</p>
                  </Link>
                </div>
              ))
            ) : (
              <div className={`rounded-[24px] border-dashed p-12 text-center shadow-sm transition-colors duration-200 md:col-span-2 xl:col-span-3 ${darkMode ? "border border-slate-700 bg-slate-800" : "border border-slate-300 bg-white"}`}>
                <p className={`text-xl font-semibold transition-colors duration-200 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{currentText.noMatches}</p>
                <p className={`mt-3 transition-colors duration-200 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{currentText.noMatchesHint}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
