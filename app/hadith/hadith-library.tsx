"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Language = "ar" | "en";

type HadithCollection = {
  id: string;
  nameAr: string;
  nameEn: string;
};

type Hadith = {
  number: number;
  arabicText: string;
  englishText: string;
};

type EditionHadith = {
  hadithnumber: number;
  text: string;
};

type EditionResponse = {
  hadiths: EditionHadith[];
};

type CommentarySearchResult = {
  id: string | number;
  hadith_text: string;
};

type CommentaryDetail = {
  explanation: string;
  explanation_ar: string;
};

type ExplanationState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "error" }
  | {
      status: "available";
      id: string;
      explanation: string;
      explanationAr: string;
    };

const collections: HadithCollection[] = [
  { id: "bukhari", nameAr: "صحيح البخاري", nameEn: "Sahih al-Bukhari" },
  { id: "muslim", nameAr: "صحيح مسلم", nameEn: "Sahih Muslim" },
  { id: "abudawud", nameAr: "سنن أبي داود", nameEn: "Sunan Abi Dawud" },
  { id: "tirmidhi", nameAr: "جامع الترمذي", nameEn: "Jami` at-Tirmidhi" },
  { id: "nasai", nameAr: "سنن النسائي", nameEn: "Sunan an-Nasa'i" },
  { id: "ibnmajah", nameAr: "سنن ابن ماجه", nameEn: "Sunan Ibn Majah" },
];

const editionsUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const commentaryApiUrl = "https://hadeethenc.com/api/v1/hadeeths";
const pageSize = 25;
const ignoredWords = new Set([
  "allah",
  "upon",
  "from",
  "with",
  "that",
  "this",
  "they",
  "their",
  "them",
  "then",
  "than",
  "what",
  "when",
  "where",
  "which",
  "while",
  "will",
  "would",
  "have",
  "has",
  "had",
  "been",
  "were",
  "your",
  "said",
  "saying",
  "reported",
  "narrated",
  "heard",
  "messenger",
  "prophet",
  "peace",
  "blessings",
  "may",
  "upon",
  "him",
  "her",
  "his",
  "she",
  "who",
  "and",
  "the",
  "for",
  "but",
  "not",
  "was",
  "are",
  "you",
  "our",
  "all",
]);

function isEditionResponse(value: unknown): value is EditionResponse {
  if (!value || typeof value !== "object" || !("hadiths" in value)) return false;
  const hadiths = value.hadiths;
  return (
    Array.isArray(hadiths) &&
    hadiths.every(
      (hadith) =>
        hadith &&
        typeof hadith === "object" &&
        "hadithnumber" in hadith &&
        typeof hadith.hadithnumber === "number" &&
        "text" in hadith &&
        typeof hadith.text === "string",
    )
  );
}

async function fetchEdition(
  language: "ara" | "eng",
  collection: string,
  signal: AbortSignal,
): Promise<EditionResponse> {
  const response = await fetch(`${editionsUrl}/${language}-${collection}.json`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`The ${language} edition returned ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (!isEditionResponse(data)) {
    throw new Error(`The ${language} edition has an unexpected format.`);
  }
  return data;
}

function isCommentarySearchResult(value: unknown): value is CommentarySearchResult {
  return (
    !!value &&
    typeof value === "object" &&
    "id" in value &&
    (typeof value.id === "string" || typeof value.id === "number") &&
    "hadith_text" in value &&
    typeof value.hadith_text === "string"
  );
}

function isCommentaryDetail(value: unknown): value is CommentaryDetail {
  return (
    !!value &&
    typeof value === "object" &&
    "explanation" in value &&
    typeof value.explanation === "string" &&
    "explanation_ar" in value &&
    typeof value.explanation_ar === "string"
  );
}

function significantWords(text: string) {
  return new Set(
    text
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLocaleLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => word.length > 3 && !ignoredWords.has(word)) ?? [],
  );
}

async function fetchSimpleExplanation(hadith: Hadith) {
  if (!hadith.englishText) return null;

  const quotedText = hadith.englishText.match(/["“]([^"”]+)(?:["”]|$)/)?.[1];
  const hadithContent =
    quotedText?.trim() ||
    hadith.englishText.split(/:\s*/).pop()?.trim() ||
    hadith.englishText;
  const searchUrl = new URL(`${commentaryApiUrl}/search/`);
  searchUrl.searchParams.set("phrase", hadithContent.slice(0, 70));
  searchUrl.searchParams.set("language", "en");
  const searchResponse = await fetch(searchUrl);
  if (searchResponse.status === 204) return null;
  if (!searchResponse.ok) {
    throw new Error(`Commentary search returned ${searchResponse.status}.`);
  }

  const searchData: unknown = await searchResponse.json();
  if (!Array.isArray(searchData) || !searchData.every(isCommentarySearchResult)) {
    throw new Error("Commentary search returned an unexpected format.");
  }

  const hadithWords = significantWords(hadithContent);
  if (hadithWords.size < 5) return null;

  const bestMatch = searchData
    .map((item) => {
      const sourceWords = significantWords(item.hadith_text);
      const overlap = [...hadithWords].filter((word) => sourceWords.has(word)).length;
      return {
        id: String(item.id),
        attribution: item.hadith_text,
        score: overlap / hadithWords.size,
        overlap,
      };
    })
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch || bestMatch.score < 0.6 || bestMatch.overlap < 5) return null;

  const detailUrl = new URL(`${commentaryApiUrl}/one/`);
  detailUrl.searchParams.set("id", bestMatch.id);
  detailUrl.searchParams.set("language", "en");
  const detailResponse = await fetch(detailUrl);
  if (!detailResponse.ok) {
    throw new Error(`Commentary detail returned ${detailResponse.status}.`);
  }

  const detail: unknown = await detailResponse.json();
  if (!isCommentaryDetail(detail)) {
    throw new Error("Commentary detail returned an unexpected format.");
  }
  if (!detail.explanation && !detail.explanation_ar) return null;

  return {
    id: bestMatch.id,
    explanation: detail.explanation,
    explanationAr: detail.explanation_ar,
  };
}

export default function HadithLibrary() {
  const [language, setLanguage] = useState<Language>("ar");
  const [selectedCollection, setSelectedCollection] = useState(collections[0].id);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [explanations, setExplanations] = useState<Record<string, ExplanationState>>({});
  const [openExplanations, setOpenExplanations] = useState<Record<string, boolean>>({});
  const isArabic = language === "ar";
  const collection =
    collections.find((item) => item.id === selectedCollection) ?? collections[0];

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetchEdition("ara", selectedCollection, controller.signal),
      fetchEdition("eng", selectedCollection, controller.signal),
    ])
      .then(([arabicEdition, englishEdition]) => {
        const englishByNumber = new Map(
          englishEdition.hadiths.map((hadith) => [hadith.hadithnumber, hadith.text.trim()]),
        );
        const combined = arabicEdition.hadiths.flatMap((hadith) => {
          const arabicText = hadith.text.trim();
          const englishText = englishByNumber.get(hadith.hadithnumber) ?? "";
          if (!arabicText && !englishText) return [];
          return [{ number: hadith.hadithnumber, arabicText, englishText }];
        });
        setHadiths(combined);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
        setHasError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [selectedCollection, retryCount]);

  const filteredHadiths = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return hadiths;
    return hadiths.filter((hadith) =>
      `${hadith.number} ${hadith.arabicText} ${hadith.englishText}`
        .toLocaleLowerCase()
        .includes(term),
    );
  }, [hadiths, query]);
  const pageCount = Math.ceil(filteredHadiths.length / pageSize);
  const visibleHadiths = filteredHadiths.slice(page * pageSize, (page + 1) * pageSize);

  const toggleExplanation = (hadith: Hadith) => {
    const key = `${selectedCollection}-${hadith.number}`;
    const isOpening = !openExplanations[key];
    setOpenExplanations((current) => ({ ...current, [key]: !current[key] }));

    if (!isOpening) return;

    const currentExplanation = explanations[key];
    if (currentExplanation && currentExplanation.status !== "error") {
      return;
    }

    setExplanations((current) => ({ ...current, [key]: { status: "loading" } }));
    void fetchSimpleExplanation(hadith)
      .then((result) => {
        setExplanations((current) => ({
          ...current,
          [key]: result ? { status: "available", ...result } : { status: "unavailable" },
        }));
      })
      .catch(() => {
        setExplanations((current) => ({ ...current, [key]: { status: "error" } }));
      });
  };

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
      className="min-h-screen text-amber-950"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
            {isArabic ? "من كتب الحديث الستة" : "From the six major hadith collections"}
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {isArabic ? "الأحاديث النبوية" : "Hadith Library"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-amber-50 sm:text-lg">
            {isArabic
              ? "ابحث وتصفح النصوص العربية وترجماتها الإنجليزية مع مرجع كل حديث."
              : "Search and browse Arabic texts, English translations, and the reference for each hadith."}
          </p>
        </header>

        <aside className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-7 text-amber-950">
          {isArabic
            ? "النص والترجمة من مصدر البيانات. عند توفر تطابق موثوق، يظهر الشرح الأصلي من موسوعة الأحاديث النبوية مع نسبته إليها؛ وقد لا يتوفر شرح لكل حديث. لا نضيف شرحًا أو نقلًا صوتيًا بالتخمين، وتختلف أرقام الأحاديث بين الطبعات."
            : "Texts and translations come from the data source. When a reliable match is found, the original explanation from HadeethEnc is shown and attributed; an explanation may not be available for every hadith. Hadith numbering can differ between editions."}{" "}
          <a
            href="https://github.com/fawazahmed0/hadith-api"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            {isArabic ? "مصدر البيانات" : "Data source"}
          </a>
        </aside>

        <section
          aria-label={isArabic ? "البحث والتصفية" : "Search and filter"}
          className="mb-7 rounded-[24px] border border-amber-900/10 bg-white/90 p-4 shadow-sm sm:p-5"
        >
          <label className="mb-4 block text-sm font-bold text-amber-900" htmlFor="collection">
            {isArabic ? "اختر الكتاب" : "Choose a collection"}
          </label>
          <select
            id="collection"
            value={selectedCollection}
            onChange={(event) => {
              setSelectedCollection(event.target.value);
              setIsLoading(true);
              setHasError(false);
              setPage(0);
            }}
            className="mb-4 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-semibold text-amber-950 outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
          >
            {collections.map((item) => (
              <option key={item.id} value={item.id}>
                {isArabic ? item.nameAr : item.nameEn}
              </option>
            ))}
          </select>
          <label className="block text-sm font-bold text-amber-900" htmlFor="hadith-search">
            {isArabic ? "ابحث في النص أو رقم الحديث" : "Search text or hadith number"}
          </label>
          <input
            id="hadith-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder={isArabic ? "اكتب كلمة أو رقمًا..." : "Enter a word or number..."}
            className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-700"
          />
          {!isLoading && !hasError && (
            <p className="mt-3 text-sm text-slate-600" role="status">
              {isArabic
                ? `${filteredHadiths.length.toLocaleString("ar-EG")} نتيجة في ${collection.nameAr}`
                : `${filteredHadiths.length.toLocaleString("en-US")} results in ${collection.nameEn}`}
            </p>
          )}
        </section>

        {isLoading && (
          <p className="rounded-2xl border border-amber-200 bg-white/85 p-8 text-center text-slate-600" role="status">
            {isArabic ? "جارٍ تحميل الأحاديث..." : "Loading hadiths..."}
          </p>
        )}

        {!isLoading && hasError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
            <p role="alert">
              {isArabic
                ? "تعذّر تحميل الأحاديث. تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى."
                : "Could not load the hadiths. Check your internet connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setHasError(false);
                setRetryCount((current) => current + 1);
              }}
              className="mt-4 rounded-full bg-red-800 px-5 py-2 font-semibold text-white hover:bg-red-700"
            >
              {isArabic ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        )}

        {!isLoading && !hasError && (
          <>
            <div className="grid gap-4">
              {visibleHadiths.map((hadith) => (
                <article
                  key={`${selectedCollection}-${hadith.number}`}
                  className="rounded-[24px] border border-amber-900/10 bg-white/90 p-5 shadow-sm shadow-amber-950/5 sm:p-6"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                      {isArabic ? collection.nameAr : collection.nameEn}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">
                      {isArabic ? `حديث رقم ${hadith.number}` : `Hadith ${hadith.number}`}
                    </span>
                  </div>
                  {hadith.arabicText && (
                    <p
                      lang="ar"
                      dir="rtl"
                      className="text-right text-2xl leading-[2.1] text-amber-950 sm:text-[1.7rem]"
                    >
                      {hadith.arabicText}
                    </p>
                  )}
                  {hadith.englishText && (
                    <p
                      lang="en"
                      dir="ltr"
                      className="mt-4 border-t border-amber-100 pt-4 text-left text-base leading-8 text-slate-700"
                    >
                      {hadith.englishText}
                    </p>
                  )}
                  <p className="mt-4 border-t border-amber-100 pt-3 text-xs font-semibold text-slate-500">
                    {isArabic
                      ? `المرجع: ${collection.nameAr}، رقم الحديث ${hadith.number}`
                      : `Source: ${collection.nameEn}, hadith ${hadith.number}`}
                  </p>
                  {(() => {
                    const explanationKey = `${selectedCollection}-${hadith.number}`;
                    const explanation = explanations[explanationKey];
                    const isExpanded = Boolean(openExplanations[explanationKey]);
                    const hasArabicExplanation =
                      explanation?.status === "available" && Boolean(explanation.explanationAr);
                    const hasEnglishExplanation =
                      explanation?.status === "available" && Boolean(explanation.explanation);
                    const showArabicExplanation =
                      hasArabicExplanation && (isArabic || !hasEnglishExplanation);
                    const explanationText =
                      explanation?.status === "available"
                        ? showArabicExplanation
                          ? explanation.explanationAr
                          : explanation.explanation
                        : "";
                    const explanationDirection =
                      showArabicExplanation ? "rtl" : "ltr";

                    return (
                      <div className="mt-4 border-t border-amber-100 pt-4">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleExplanation(hadith)}
                          className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
                        >
                          {explanation?.status === "loading"
                            ? isArabic
                              ? "جارٍ البحث عن شرح موثوق..."
                              : "Finding a sourced explanation..."
                            : isExpanded
                              ? isArabic
                                ? "إخفاء الشرح المبسط"
                                : "Hide simple explanation"
                              : isArabic
                                ? "عرض الشرح المبسط"
                                : "Show simple explanation"}
                        </button>
                        {isExpanded && (
                          <div className="mt-3 rounded-xl bg-amber-50/80 p-4">
                            {explanation?.status === "loading" && (
                              <p role="status" className="text-sm leading-7 text-slate-600">
                                {isArabic
                                  ? "جارٍ البحث في مصدر الشروح..."
                                  : "Searching the commentary source..."}
                              </p>
                            )}
                            {explanation?.status === "unavailable" && (
                              <p role="status" className="text-sm leading-7 text-slate-600">
                                {isArabic
                                  ? "لم نعثر على شرح مطابق موثوق لهذا الحديث في مصدر الشروح."
                                  : "No confidently matching explanation was found in the commentary source."}
                              </p>
                            )}
                            {explanation?.status === "error" && (
                              <p role="alert" className="text-sm leading-7 text-red-800">
                                {isArabic
                                  ? "تعذر الوصول إلى مصدر الشرح. أغلق هذا القسم وافتحه لإعادة المحاولة."
                                  : "Could not reach the commentary source. Close and reopen this section to try again."}
                              </p>
                            )}
                            {explanation?.status === "available" && (
                              <>
                                <p className="mb-2 text-xs font-bold text-amber-900">
                                  {isArabic
                                    ? "شرح مبسط من موسوعة الأحاديث النبوية"
                                    : "Simple explanation from HadeethEnc"}
                                </p>
                                <p
                                  lang={explanationDirection === "rtl" ? "ar" : "en"}
                                  dir={explanationDirection}
                                  className={`text-sm leading-8 text-slate-700 ${explanationDirection === "rtl" ? "text-right" : "text-left"}`}
                                >
                                  {explanationText}
                                </p>
                                <p className="mt-3 border-t border-amber-200 pt-2 text-xs text-slate-500">
                                  {isArabic
                                    ? `المصدر: موسوعة الأحاديث النبوية، سجل ${explanation.id}`
                                    : `Source: HadeethEnc, record ${explanation.id}`}
                                  {" · "}
                                  <a
                                    href={`https://hadeethenc.com/${isArabic ? "ar" : "en"}/browse/hadith/${explanation.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold underline underline-offset-2"
                                  >
                                    HadeethEnc
                                  </a>
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </article>
              ))}
            </div>

            {visibleHadiths.length === 0 && (
              <p className="rounded-2xl border border-amber-200 bg-white/85 p-8 text-center text-slate-600">
                {isArabic ? "لا توجد أحاديث مطابقة للبحث." : "No hadiths match your search."}
              </p>
            )}

            {pageCount > 1 && (
              <nav
                aria-label={isArabic ? "صفحات الأحاديث" : "Hadith pages"}
                className="mt-6 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isArabic ? "السابق" : "Previous"}
                </button>
                <span className="text-sm text-slate-600" aria-live="polite">
                  {isArabic
                    ? `${(page + 1).toLocaleString("ar-EG")} من ${pageCount.toLocaleString("ar-EG")}`
                    : `${page + 1} of ${pageCount}`}
                </span>
                <button
                  type="button"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                  className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isArabic ? "التالي" : "Next"}
                </button>
              </nav>
            )}
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
