"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { quranStories } from "./stories";

type Language = "ar" | "en";

export default function QuranStoriesLibrary() {
  const [language, setLanguage] = useState<Language>("ar");
  const [search, setSearch] = useState("");
  const isArabic = language === "ar";

  const visibleStories = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return quranStories;
    return quranStories.filter((story) =>
      [
        story.titleAr,
        story.titleEn,
        story.summaryAr,
        story.summaryEn,
        story.lessonAr,
        story.lessonEn,
        ...story.references,
      ].some((value) => value.toLocaleLowerCase().includes(term)),
    );
  }, [search]);

  return (
    <main dir={isArabic ? "rtl" : "ltr"} lang={language} className="min-h-screen text-amber-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
          >
            {isArabic ? "← العودة إلى القرآن" : "← Back to Quran"}
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

        <header className="mb-8 overflow-hidden rounded-[30px] border border-amber-900/10 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 p-7 text-white shadow-xl shadow-amber-950/15 sm:p-10">
          <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-amber-200">
            {isArabic ? "حكايات من القرآن الكريم" : "Stories from the Noble Quran"}
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {isArabic ? "قصص القرآن" : "Quran Stories"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-amber-50 sm:text-lg">
            {isArabic
              ? "قصص قرآنية مبسطة للصغار، مع مواضعها في القرآن وعبرة من كل قصة. لا تُصوَّر الأنبياء في الرسوم هنا."
              : "Child-friendly summaries of major Quranic stories, with Quran references and a lesson from each. The videos linked here should not depict prophets."}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              {isArabic ? `${quranStories.length} قصة` : `${quranStories.length} stories`}
            </span>
            <label className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              <span>{isArabic ? "ابحث" : "Search"}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isArabic ? "اسم القصة أو السورة..." : "Story or surah..."}
                className="min-w-36 bg-transparent text-white outline-none placeholder:text-amber-200"
                aria-label={isArabic ? "ابحث في القصص" : "Search stories"}
              />
            </label>
          </div>
        </header>

        <aside className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-sm leading-7 text-amber-950">
          {isArabic
            ? "يفتح كل زر فيديو مباشرًا على YouTube خارج الموقع. راجعوا الفيديو مع ولي الأمر؛ لم نتحقق من ملاءمة كل المشاهد للأطفال أو من ظهور الأنبياء أو جنس الراوي. السرد المكتوب تلخيص تعليمي، والمرجع هو الآيات المذكورة."
            : "Each button opens a direct YouTube video outside this site. Please review it with a parent; we have not verified every scene for children, whether prophets are depicted, or the narrator's gender. The written stories are educational summaries; the cited verses are the source."}
        </aside>

        <div className="grid gap-5 md:grid-cols-2">
          {visibleStories.map((story, index) => {
            const title = isArabic ? story.titleAr : story.titleEn;
            const videoUrl = `https://www.youtube.com/watch?v=${story.videoId}`;
            return (
              <article
                key={story.id}
                className="rounded-[24px] border border-amber-900/10 bg-white/90 p-5 shadow-sm shadow-amber-950/5 sm:p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-amber-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-1 text-xl font-black text-amber-950">{title}</h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    {isArabic ? "قصة قرآنية" : "Quran story"}
                  </span>
                </div>
                <p className={`text-base leading-8 text-slate-700 ${isArabic ? "text-right" : "text-left"}`}>
                  {isArabic ? story.summaryAr : story.summaryEn}
                </p>
                <div className="mt-4 rounded-xl bg-amber-50/80 p-4">
                  <p className="text-xs font-bold text-amber-800">
                    {isArabic ? "العبرة" : "Lesson"}
                  </p>
                  <p className={`mt-1 text-sm leading-7 text-slate-700 ${isArabic ? "text-right" : "text-left"}`}>
                    {isArabic ? story.lessonAr : story.lessonEn}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-bold text-amber-800">
                    {isArabic ? "المواضع في القرآن" : "Quran references"}
                  </p>
                  <p className={`mt-1 text-sm leading-6 text-slate-600 ${isArabic ? "text-right" : "text-left"}`}>
                    {isArabic ? story.references.join("، ") : story.references.join(", ")}
                  </p>
                </div>
                <div className="mt-5 border-t border-amber-100 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/quran-stories/${story.id}`}
                      className="inline-flex rounded-full bg-amber-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
                    >
                      {isArabic ? "اقرأ القصة كاملة" : "Read the full story"}
                    </Link>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
                    >
                      {isArabic ? "شاهد الفيديو ▶" : "Watch video ▶"}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {visibleStories.length === 0 && (
          <p className="rounded-2xl border border-amber-200 bg-white/85 p-8 text-center text-slate-600">
            {isArabic ? "لا توجد قصص مطابقة للبحث." : "No stories match your search."}
          </p>
        )}
      </div>
    </main>
  );
}
