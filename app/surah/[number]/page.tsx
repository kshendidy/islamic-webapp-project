"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
    makki: "مكية",
    madani: "مدنية",
    close: "إغلاق",
    page: "صفحة",
    of: "من",
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
    makki: "Meccan",
    madani: "Medinan",
    close: "Close",
    page: "Page",
    of: "of",
  },
};

export default function SurahPage() {
  const params = useParams();
  const surahNumber = Number(params?.number ?? 1);

  const [language, setLanguage] = useState<Language>("ar");
  const [darkMode, setDarkMode] = useState(false);
  const [surahDisplayLanguage, setSurahDisplayLanguage] = useState<Language>("ar");
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTafsir, setSelectedTafsir] = useState<{ayahNumber: number; tafsirText: string} | null>(null);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const surahAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRequestIdRef = useRef(0);
  const readingProgressKey = "quran-reading-progress";
  const lastReadKey = "quran-last-read";

  const VERSES_PER_PAGE = 12;

  const getReadingProgress = () => {
    if (typeof window === "undefined") return {} as Record<number, number>;
    try {
      const raw = localStorage.getItem(readingProgressKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {} as Record<number, number>;
    }
  };

  const getRevealationTypeLabel = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("makki") || lowerType.includes("meccan")) return language === "ar" ? copy.ar.makki : copy.en.makki;
    if (lowerType.includes("madani") || lowerType.includes("medinan")) return language === "ar" ? copy.ar.madani : copy.en.madani;
    return type;
  };

  useEffect(() => {
    const saved = localStorage.getItem("quran-favorites");
    if (saved) setFavorites(JSON.parse(saved));
    const savedDark = localStorage.getItem("quran-dark-mode");
    if (savedDark) setDarkMode(JSON.parse(savedDark));
    const savedLanguage = localStorage.getItem("quran-language");
    if (savedLanguage) setLanguage(JSON.parse(savedLanguage));
    const savedSurahDisplayLanguage = localStorage.getItem("quran-surah-display-language");
    if (savedSurahDisplayLanguage) setSurahDisplayLanguage(JSON.parse(savedSurahDisplayLanguage));
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("quran-language", JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    localStorage.setItem("quran-surah-display-language", JSON.stringify(surahDisplayLanguage));
  }, [surahDisplayLanguage]);

  useEffect(() => {
    async function loadSurah() {
      try {
        const [arabicResp, englishResp, tafsirResp] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.muyassar`),
        ]);

        if (!arabicResp.ok || !englishResp.ok) throw new Error("Not found");

        const arabic = (await arabicResp.json()).data;
        const english = (await englishResp.json()).data;
        const tafsir = tafsirResp.ok ? (await tafsirResp.json()).data : {};

        const ayahs = (arabic.ayahs ?? []).map((ayah: any, i: number) => ({
          numberInSurah: Number(ayah.numberInSurah ?? i + 1),
          text: ayah.text ?? "",
          translationText: english.ayahs?.[i]?.text ?? "",
          tafsirText: tafsir.ayahs?.[i]?.text ?? "",
        }));

        setSurah({
          number: surahNumber,
          name: arabic.name ?? "",
          englishName: arabic.englishName ?? "",
          englishNameTranslation: arabic.englishNameTranslation ?? "",
          numberOfAyahs: ayahs.length,
          revelationType: arabic.revelationType ?? "",
          ayahs,
        });
        setCurrentPage(0);
      } catch (e) {
        setError(language === "ar" ? copy.ar.notFound : copy.en.notFound);
      } finally {
        setIsLoading(false);
      }
    }
    loadSurah();
  }, [language, surahNumber]);

  const direction = language === "ar" ? "rtl" : "ltr";
  const currentText = copy[language];
  const isFavorite = favorites.includes(surahNumber);

  const pagesData = useMemo(() => {
    if (!surah) return [];
    const pages = [];
    for (let i = 0; i < surah.ayahs.length; i += VERSES_PER_PAGE) {
      pages.push(surah.ayahs.slice(i, i + VERSES_PER_PAGE));
    }
    return pages;
  }, [surah]);

  const totalPages = pagesData.length;
  const hasReadingMarker = currentPage > 0;

  useEffect(() => {
    if (!surah) return;

    const pageElements = document.querySelectorAll<HTMLElement>("[data-quran-page]");
    const observer = new IntersectionObserver(
      (entries) => {
        const visiblePage = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const pageIndex = Number(visiblePage?.target.getAttribute("data-page-index"));

        if (Number.isInteger(pageIndex)) setCurrentPage(pageIndex);
      },
      { rootMargin: "-35% 0px -35% 0px" },
    );

    pageElements.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [surah]);

  useEffect(() => {
    if (!surah || !mounted || totalPages === 0) return;

    const progress = getReadingProgress();
    const savedPage = Number(progress[surahNumber] ?? 0);

    if (Number.isFinite(savedPage) && savedPage >= 0 && savedPage < totalPages) {
      setCurrentPage(savedPage);
      if (savedPage > 0) {
        window.requestAnimationFrame(() => {
          document.getElementById(`quran-page-${savedPage}`)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    }
  }, [mounted, surah, surahNumber, totalPages]);

  useEffect(() => {
    if (!surah || !mounted) return;

    const progress = getReadingProgress();
    progress[surahNumber] = currentPage;
    localStorage.setItem(readingProgressKey, JSON.stringify(progress));
    localStorage.setItem(lastReadKey, JSON.stringify({
      surahNumber,
      page: currentPage,
      updatedAt: Date.now(),
    }));
  }, [currentPage, mounted, surah, surahNumber]);

  const playAyahAudio = async (ayahNumber: number) => {
    const requestId = ++audioRequestIdRef.current;
    surahAudioRef.current?.pause();
    audioRef.current?.pause();

    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.alafasy`);
      if (!response.ok) return;

      const result = await response.json();
      const src = result?.data?.audio;
      if (!src || requestId !== audioRequestIdRef.current) return;

      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = src;
      audio.load();
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error("Unable to play verse audio:", error);
    }
  };

  const stopAyahAudio = () => {
    audioRequestIdRef.current += 1;
    audioRef.current?.pause();
  };

  const renderAyahText = (ayah: Ayah) => {
    const displayText = surahDisplayLanguage === "ar" ? ayah.text : ayah.translationText;
    return (
      <>
        <span>{displayText}</span>
        <button type="button" onClick={() => void playAyahAudio(ayah.numberInSurah)} className={`mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${darkMode ? "border-slate-500 bg-slate-700 text-slate-100" : "border-amber-300 bg-amber-100 text-amber-800"}`} aria-label={`Play verse ${ayah.numberInSurah}`}>
          {ayah.numberInSurah}
        </button>
      </>
    );
  };

  if (!mounted || isLoading) {
    return (
      <main dir={direction} className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? "bg-slate-900" : "bg-gradient-to-br from-amber-50 to-amber-50"}`}>
        <div className={`text-center p-8 rounded-2xl border ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white"}`}>
          <p className="text-lg font-medium">{currentText.loading}</p>
        </div>
      </main>
    );
  }

  if (error || !surah) {
    return (
      <main dir={direction} className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? "bg-slate-900" : "bg-gradient-to-br from-amber-50 to-amber-50"}`}>
        <div className={`text-center p-8 rounded-2xl border ${darkMode ? "border-red-900 bg-red-950 text-red-200" : "border-red-200 bg-red-50"}`}>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main dir={direction} className="min-h-screen pb-8 bg-transparent">
      {/* Header */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur ${darkMode ? "border-slate-700 bg-slate-800/95" : "border-slate-200 bg-white/95"}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center gap-3">
          <Link href="/" className={`rounded-full border px-3 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200" : "border-slate-200 bg-white hover:bg-gray-50 text-slate-700"}`}>
            ← {currentText.back}
          </Link>
          <div className="flex gap-2">
            <button onClick={() => setSurahDisplayLanguage((l) => (l === "ar" ? "en" : "ar"))} className={`rounded-full border px-3 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200" : "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"}`} title={surahDisplayLanguage === "ar" ? "Show in Arabic" : "Show in English"}>📖 {surahDisplayLanguage === "ar" ? "AR" : "EN"}</button>
            <button onClick={() => setLanguage((l) => (l === "ar" ? "en" : "ar"))} className={`rounded-full border px-3 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200" : "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"}`}>{currentText.language}</button>
            <button onClick={() => setDarkMode(!darkMode)} className={`rounded-full border px-3 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200" : "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"}`}>{currentText.darkMode}</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Title */}
        <section className={`mb-8 rounded-2xl border p-6 text-center ${darkMode ? "border-slate-700 bg-slate-800" : "border-amber-200 bg-gradient-to-b from-amber-50 to-amber-50"}`}>
          <h1 className={`text-5xl font-bold mb-3 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{surahDisplayLanguage === "ar" ? surah.name : surah.englishName}</h1>
          <p className={`text-lg ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{surahDisplayLanguage === "ar" ? surah.englishName : surah.name}</p>
        </section>

        {/* Audio */}
        <section className={`mb-8 rounded-2xl border p-6 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
          <audio
            ref={surahAudioRef}
            controls
            className="w-full"
            src={`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`}
            onPlay={stopAyahAudio}
          />
        </section>

        {hasReadingMarker && (
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${darkMode ? "border-amber-700 bg-amber-900/30 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            📍 {language === "ar" ? `استئناف من الصفحة ${currentPage + 1}` : `Resume from page ${currentPage + 1}`}
          </div>
        )}

        {/* Quran pages in continuous vertical reading order */}
        <div className="mb-8 space-y-6">
          {pagesData.map((pageVerses, pageIndex) => (
            <section
              key={pageIndex}
              id={`quran-page-${pageIndex}`}
              data-quran-page
              data-page-index={pageIndex}
              aria-label={`${currentText.page} ${pageIndex + 1} ${currentText.of} ${totalPages}`}
              className={`scroll-mt-24 rounded-[28px] border px-5 py-6 sm:px-8 sm:py-8 ${darkMode ? "border-amber-800/60 bg-slate-800" : "border-amber-300 bg-gradient-to-b from-amber-50 via-amber-50 to-white"}`}
              style={
                darkMode
                  ? {
                      boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(251,191,36,0.18), inset 0 0 30px rgba(15,23,42,0.9)",
                    }
                  : {
                      boxShadow: "0 26px 70px rgba(120, 84, 20, 0.18), inset 0 0 0 1px rgba(192,132,42,0.28), inset 0 0 30px rgba(255,255,255,0.8)",
                    }
              }
            >
              <p className={`mb-5 text-center text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                {currentText.page} {pageIndex + 1} / {totalPages}
              </p>
              <div dir={surahDisplayLanguage === "ar" ? "rtl" : "ltr"} className="space-y-1">
                {pageVerses.map((ayah) => (
                  <div key={ayah.numberInSurah} className="py-0">
                    <p className={`text-[1.6rem] sm:text-[1.8rem] leading-[1.65] font-medium text-center tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`} dir={surahDisplayLanguage === "ar" ? "rtl" : "ltr"}>
                      {renderAyahText(ayah)}
                    </p>
                    {ayah.tafsirText && (
                      <div className="mt-0.5 text-center">
                        <button onClick={() => setSelectedTafsir({ayahNumber: ayah.numberInSurah, tafsirText: ayah.tafsirText ?? ""})} className={`text-xs font-medium ${darkMode ? "text-amber-400 hover:text-amber-300" : "text-amber-700 hover:text-amber-800"}`}>
                          📖 {currentText.tafsir}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`/surah/${Math.max(1, surahNumber - 1)}`} className={`rounded-full border px-4 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white hover:bg-gray-50"}`}>← {currentText.previous}</Link>
          <button onClick={() => {
            const next = isFavorite ? favorites.filter((f) => f !== surahNumber) : [...favorites, surahNumber];
            setFavorites(next);
            localStorage.setItem("quran-favorites", JSON.stringify(next));
          }} className={`rounded-full border px-4 py-2 text-sm font-medium ${isFavorite ? (darkMode ? "border-amber-600 bg-amber-700 text-white" : "border-amber-400 bg-amber-100 text-amber-800") : (darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white hover:bg-gray-50")}`}>{isFavorite ? "★" : "☆"}</button>
          <Link href={`/surah/${Math.min(114, surahNumber + 1)}`} className={`rounded-full border px-4 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white hover:bg-gray-50"}`}>{currentText.next} →</Link>
        </div>
      </div>

      {/* Tafsir Modal */}
      {selectedTafsir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`rounded-2xl border max-w-2xl w-full max-h-[80vh] overflow-y-auto ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white"}`}>
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${darkMode ? "border-slate-700 bg-slate-750" : "border-slate-200 bg-slate-50"}`}>
              <h2 className="text-lg font-bold">{currentText.tafsir} - {surah.number}:{selectedTafsir.ayahNumber}</h2>
              <button onClick={() => setSelectedTafsir(null)} className="text-2xl leading-none">×</button>
            </div>
            <div className="p-6 text-right leading-relaxed">
              <p>{selectedTafsir.tafsirText}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
