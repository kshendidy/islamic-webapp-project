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
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTafsir, setSelectedTafsir] = useState<{ayahNumber: number; tafsirText: string} | null>(null);
  const [mounted, setMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pageDirection, setPageDirection] = useState<"next" | "prev" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const VERSES_PER_PAGE = 12;

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
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("quran-language", JSON.stringify(language));
  }, [language]);

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

  const currentPageVerses = pagesData[currentPage] || [];
  const totalPages = pagesData.length;

  const handlePrevPage = () => {
    if (currentPage === 0) return;
    setPageDirection("prev");
    setIsAnimating(true);
    window.setTimeout(() => {
      setCurrentPage((p) => Math.max(0, p - 1));
      setIsAnimating(false);
      setPageDirection(null);
    }, 180);
  };

  const handleNextPage = () => {
    if (currentPage >= totalPages - 1) return;
    setPageDirection("next");
    setIsAnimating(true);
    window.setTimeout(() => {
      setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
      setIsAnimating(false);
      setPageDirection(null);
    }, 180);
  };

  const playAyahAudio = async (ayahNumber: number) => {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.alafasy`);
      if (!response.ok) return;

      const result = await response.json();
      const src = result?.data?.audio;
      if (!src) return;

      const audio = audioRef.current ?? new Audio();
      audio.src = src;
      audio.load();
      audio.currentTime = 0;
      await audio.play();
      audioRef.current = audio;
    } catch (error) {
      console.error("Unable to play verse audio:", error);
    }
  };

  const renderAyahText = (ayah: Ayah) => {
    const words = ayah.text.trim().split(/\s+/);
    if (words.length <= 1) {
      return (
        <>
          <span>{ayah.text}</span>
          <button type="button" onClick={() => void playAyahAudio(ayah.numberInSurah)} className={`ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${darkMode ? "border-slate-500 bg-slate-700 text-slate-100" : "border-emerald-300 bg-emerald-100 text-emerald-800"}`} aria-label={`Play verse ${ayah.numberInSurah}`}>
            {ayah.numberInSurah}
          </button>
        </>
      );
    }

    const splitIndex = Math.max(1, Math.ceil(words.length / 2));

    return (
      <>
        {words.slice(0, splitIndex).map((word, index) => (
          <span key={`${ayah.numberInSurah}-left-${index}`}>{word} </span>
        ))}
        <button type="button" onClick={() => void playAyahAudio(ayah.numberInSurah)} className={`mx-1 inline-flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${darkMode ? "border-slate-500 bg-slate-700 text-slate-100" : "border-emerald-300 bg-emerald-100 text-emerald-800"}`} aria-label={`Play verse ${ayah.numberInSurah}`}>
          {ayah.numberInSurah}
        </button>
        {words.slice(splitIndex).map((word, index) => (
          <span key={`${ayah.numberInSurah}-right-${index}`}>{` ${word}`}</span>
        ))}
      </>
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if ((diff > 0 && language === "ar") || (diff < 0 && language === "en")) handlePrevPage();
      else handleNextPage();
    }

    setTouchStart(null);
  };

  if (!mounted || isLoading) {
    return (
      <main dir={direction} className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? "bg-slate-900" : "bg-gradient-to-br from-amber-50 to-blue-50"}`}>
        <div className={`text-center p-8 rounded-2xl border ${darkMode ? "border-slate-700 bg-slate-800 text-slate-100" : "border-slate-200 bg-white"}`}>
          <p className="text-lg font-medium">{currentText.loading}</p>
        </div>
      </main>
    );
  }

  if (error || !surah) {
    return (
      <main dir={direction} className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? "bg-slate-900" : "bg-gradient-to-br from-amber-50 to-blue-50"}`}>
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
            <button onClick={() => setLanguage((l) => (l === "ar" ? "en" : "ar"))} className={`rounded-full border px-3 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200" : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800"}`}>{currentText.language}</button>
            <button onClick={() => setDarkMode(!darkMode)} className={`rounded-full border px-3 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200" : "border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800"}`}>{currentText.darkMode}</button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Title */}
        <section className={`mb-8 rounded-2xl border p-6 text-center ${darkMode ? "border-slate-700 bg-slate-800" : "border-amber-200 bg-gradient-to-b from-amber-50 to-yellow-50"}`}>
          <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${darkMode ? "text-slate-400" : "text-emerald-700"}`}>{language === "ar" ? "سورة" : "Surah"} {surah.number}</p>
          <h1 className={`text-5xl font-bold mb-3 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{surah.name}</h1>
          <p className={`text-lg ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{surah.englishName}</p>
          <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{surah.englishNameTranslation} • {getRevealationTypeLabel(surah.revelationType)}</p>
        </section>

        {/* Audio */}
        <section className={`mb-8 rounded-2xl border p-6 ${darkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
          <audio controls className="w-full" src={`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`} />
        </section>

        {/* Book Pages */}
        <section
          className={`mb-8 rounded-[28px] border px-5 py-4 min-h-[560px] flex flex-col justify-center transition-all ${darkMode ? "border-amber-800/60 bg-slate-800" : "border-amber-300 bg-gradient-to-b from-amber-50 via-yellow-50 to-white"}`}
          style={
            darkMode
              ? {
                  boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(251,191,36,0.18), inset 0 0 30px rgba(15,23,42,0.9)",
                }
              : {
                  boxShadow: "0 26px 70px rgba(120, 84, 20, 0.18), inset 0 0 0 1px rgba(192,132,42,0.28), inset 0 0 30px rgba(255,255,255,0.8)",
                }
          }
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative overflow-hidden rounded-[22px] border border-amber-300/50" style={{ perspective: "1600px", background: darkMode ? "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(30,41,59,0.98))" : "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,248,220,0.82))" }}>
            <div className="pointer-events-none absolute inset-0 rounded-[22px]" style={{ background: darkMode ? "linear-gradient(90deg, rgba(251,191,36,0.10), transparent 12%, transparent 88%, rgba(251,191,36,0.10)), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))" : "linear-gradient(90deg, rgba(146,64,14,0.08), transparent 12%, transparent 88%, rgba(146,64,14,0.08)), linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))" }} />
            <div
              className="relative transition-all duration-500 ease-out"
              style={
                isAnimating
                  ? {
                      transform:
                        pageDirection === "next"
                          ? "perspective(1600px) rotateY(-8deg) translateX(12px) scale(0.99)"
                          : "perspective(1600px) rotateY(8deg) translateX(-12px) scale(0.99)",
                      opacity: 0.92,
                      transformOrigin: language === "ar" ? "right center" : "left center",
                    }
                  : {
                      transform: "perspective(1600px) rotateY(0deg) translateX(0px)",
                      opacity: 1,
                    }
              }
            >
              <div className="space-y-0 py-4 px-2 sm:px-3">
                {currentPageVerses.map((ayah) => (
                  <div key={ayah.numberInSurah} className="py-0">
                    <p className={`text-[1.6rem] sm:text-[1.8rem] leading-[1.65] font-medium text-center tracking-tight ${darkMode ? "text-slate-100" : "text-slate-900"}`} dir="rtl">
                      {renderAyahText(ayah)}
                    </p>
                    {ayah.tafsirText && (
                      <div className="mt-0.5 text-center">
                        <button onClick={() => setSelectedTafsir({ayahNumber: ayah.numberInSurah, tafsirText: ayah.tafsirText ?? ""})} className={`text-xs font-medium ${darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-700 hover:text-emerald-800"}`}>
                          📖 {currentText.tafsir}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-400/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button onClick={handlePrevPage} disabled={currentPage === 0} className={`px-5 py-2 rounded-full font-medium ${currentPage === 0 ? (darkMode ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed") : (darkMode ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200")}`}>{currentText.previous}</button>
            <span className={`text-xs sm:text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{currentText.page} {currentPage + 1} / {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages - 1} className={`px-5 py-2 rounded-full font-medium ${currentPage === totalPages - 1 ? (darkMode ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed") : (darkMode ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200")}`}>{currentText.next}</button>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`/surah/${Math.max(1, surahNumber - 1)}`} className={`rounded-full border px-4 py-2 text-sm font-medium ${darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white hover:bg-gray-50"}`}>← {currentText.previous}</Link>
          <button onClick={() => {
            const next = isFavorite ? favorites.filter((f) => f !== surahNumber) : [...favorites, surahNumber];
            setFavorites(next);
            localStorage.setItem("quran-favorites", JSON.stringify(next));
          }} className={`rounded-full border px-4 py-2 text-sm font-medium ${isFavorite ? (darkMode ? "border-emerald-600 bg-emerald-700 text-white" : "border-emerald-400 bg-emerald-100 text-emerald-800") : (darkMode ? "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700" : "border-slate-200 bg-white hover:bg-gray-50")}`}>{isFavorite ? "★" : "☆"}</button>
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
