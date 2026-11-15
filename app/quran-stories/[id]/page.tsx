"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { quranStories } from "../stories";
import { quranStoryNarratives } from "../narratives";

type Language = "ar" | "en";

function splitNarration(text: string, maxLength = 220) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let chunk = "";

  for (const word of words) {
    if (chunk && `${chunk} ${word}`.length > maxLength) {
      chunks.push(chunk);
      chunk = word;
    } else {
      chunk = chunk ? `${chunk} ${word}` : word;
    }
  }

  if (chunk) chunks.push(chunk);
  return chunks;
}

export default function QuranStoryPage() {
  const params = useParams<{ id: string }>();
  const story = quranStories.find((item) => item.id === params.id);
  const narrative = story ? quranStoryNarratives[story.id] : undefined;

  if (!story || !narrative) {
    return (
      <main className="min-h-screen p-8 text-center text-amber-950">
        <p className="mb-4">القصة غير موجودة.</p>
        <Link href="/quran-stories" className="font-bold text-amber-800 underline">
          العودة إلى قصص القرآن
        </Link>
      </main>
    );
  }

  return <StoryDetail key={story.id} story={story} narrative={narrative} />;
}

function StoryDetail({
  story,
  narrative,
}: {
  story: (typeof quranStories)[number];
  narrative: (typeof quranStoryNarratives)[string];
}) {
  const [language, setLanguage] = useState<Language>("ar");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState("default");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechChunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const playbackRequestRef = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const synthesis = window.speechSynthesis;
    const updateVoices = () => {
      setVoices(synthesis.getVoices());
      setIsSpeechSupported(true);
    };

    updateVoices();
    synthesis.addEventListener("voiceschanged", updateVoices);
    return () => {
      synthesis.removeEventListener("voiceschanged", updateVoices);
      synthesis.cancel();
      playbackRequestRef.current += 1;
      utteranceRef.current = null;
      speechChunksRef.current = [];
    };
  }, []);

  const languageVoices = useMemo(
    () => voices.filter((voice) => voice.lang.toLowerCase().startsWith(language)),
    [language, voices],
  );

  const isArabic = language === "ar";
  const videoUrl = `https://www.youtube.com/watch?v=${story.videoId}`;
  const storyIndex = quranStories.findIndex((item) => item.id === story.id);
  const previousStory = quranStories[storyIndex - 1];
  const nextStory = quranStories[storyIndex + 1];

  const stopNarration = () => {
    playbackRequestRef.current += 1;
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    speechChunksRef.current = [];
    chunkIndexRef.current = 0;
    setIsPlaying(false);
  };

  const playNarration = () => {
    if (!isSpeechSupported || !("speechSynthesis" in window)) {
      setSpeechError(isArabic ? "القراءة الصوتية غير مدعومة في هذا المتصفح." : "Speech playback is not supported in this browser.");
      return;
    }

    stopNarration();
    setSpeechError("");
    const voice = languageVoices.find((option) => option.voiceURI === selectedVoiceUri);
    if (selectedVoiceUri !== "default" && !voice) {
      setSpeechError(isArabic ? "الصوت المحدد غير متاح الآن. اختر صوتًا آخر." : "The selected voice is no longer available. Choose another voice.");
      return;
    }

    speechChunksRef.current = splitNarration((isArabic ? narrative.ar : narrative.en).join(" "));
    chunkIndexRef.current = 0;
    const requestId = playbackRequestRef.current;
    setIsPlaying(true);

    const speakNextChunk = () => {
      if (requestId !== playbackRequestRef.current) return;
      const text = speechChunksRef.current[chunkIndexRef.current];
      if (!text) {
        utteranceRef.current = null;
        speechChunksRef.current = [];
        setIsPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang ?? (isArabic ? "ar" : "en");
      if (voice) utterance.voice = voice;
      utterance.onend = () => {
        if (requestId !== playbackRequestRef.current) return;
        chunkIndexRef.current += 1;
        speakNextChunk();
      };
      utterance.onerror = (event) => {
        if (requestId !== playbackRequestRef.current) return;
        utteranceRef.current = null;
        speechChunksRef.current = [];
        setIsPlaying(false);
        if (event.error !== "interrupted" && event.error !== "canceled") {
          setSpeechError(isArabic ? "تعذرت قراءة القصة صوتيًا. حاول اختيار صوت آخر." : "The story could not be read aloud. Try selecting another voice.");
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNextChunk();
  };

  return (
    <main dir={isArabic ? "rtl" : "ltr"} lang={language} className="min-h-screen text-amber-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/quran-stories"
            className="rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
          >
            {isArabic ? "← جميع القصص" : "← All stories"}
          </Link>
          <button
            type="button"
            onClick={() => {
              stopNarration();
              setSpeechError("");
              setSelectedVoiceUri("default");
              setLanguage(isArabic ? "en" : "ar");
            }}
            className="rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
          >
            {isArabic ? "English" : "العربية"}
          </button>
        </nav>

        <header className="mb-6 rounded-[28px] bg-gradient-to-br from-amber-950 via-amber-900 to-amber-800 p-7 text-white shadow-xl shadow-amber-950/15 sm:p-9">
          <p className="mb-2 text-sm font-semibold text-amber-200">
            {isArabic ? "قصة من القرآن الكريم" : "A story from the Noble Quran"}
          </p>
          <h1 className="text-3xl font-black sm:text-4xl">{isArabic ? story.titleAr : story.titleEn}</h1>
          <p className="mt-4 leading-8 text-amber-50">
            {isArabic
              ? "سرد موسّع ومبسط للصغار، أساسه القرآن الكريم، مع ما ثبت من السنة وما يوضحه التفسير المعتبر."
              : "An expanded, child-friendly retelling based on the Quran, supplemented by authenticated hadith and reliable tafsir."}
          </p>
        </header>

        <section className="mb-6 rounded-[24px] border border-amber-200 bg-white/90 p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-amber-950">
            {isArabic ? "استمع إلى القصة" : "Listen to the story"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {isArabic
              ? "يستخدم هذا الخيار الصوت المتاح في جهازك. قد يختلف الصوت وجنسه حسب الجهاز والمتصفح."
              : "This uses a voice available on your device. The voice and its gender may vary by device and browser."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span>{isArabic ? "الصوت" : "Voice"}</span>
              <select
                value={selectedVoiceUri}
                onChange={(event) => setSelectedVoiceUri(event.target.value)}
                disabled={!isSpeechSupported}
                className="max-w-72 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={isArabic ? "اختر صوت القراءة" : "Choose narration voice"}
              >
                <option value="default">{isArabic ? "الصوت الافتراضي" : "Default voice"}</option>
                {languageVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </label>
            {isPlaying ? (
              <button
                type="button"
                onClick={stopNarration}
                className="rounded-full bg-amber-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
              >
                {isArabic ? "إيقاف الصوت ■" : "Stop narration ■"}
              </button>
            ) : (
              <button
                type="button"
                onClick={playNarration}
                disabled={!isSpeechSupported}
                className="rounded-full bg-amber-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isArabic ? "استمع إلى القصة ▶" : "Play narration ▶"}
              </button>
            )}
          </div>
          {!isSpeechSupported && (
            <p role="status" className="mt-3 text-sm text-amber-900">
              {isArabic ? "القراءة الصوتية غير مدعومة في هذا المتصفح." : "Speech playback is not supported in this browser."}
            </p>
          )}
          {speechError && <p role="status" className="mt-3 text-sm text-red-700">{speechError}</p>}
        </section>

        <article className="rounded-[24px] border border-amber-900/10 bg-white/95 p-6 shadow-sm sm:p-9">
          <h2 className="mb-5 text-2xl font-black text-amber-950">
            {isArabic ? "القصة كاملة" : "The full story"}
          </h2>
          <div className="space-y-5">
            {(isArabic ? narrative.ar : narrative.en).map((paragraph, index) => (
              <p key={index} className="text-lg leading-9 text-slate-800 sm:text-xl">
                {paragraph}
              </p>
            ))}
          </div>
          <section className="mt-8 rounded-xl bg-amber-50/80 p-5">
            <h2 className="text-sm font-bold text-amber-800">{isArabic ? "العبرة" : "Lesson"}</h2>
            <p className="mt-2 text-base leading-8 text-slate-700">
              {isArabic ? story.lessonAr : story.lessonEn}
            </p>
          </section>
          <section className="mt-6">
            <h2 className="text-sm font-bold text-amber-800">
              {isArabic ? "المواضع في القرآن" : "Quran references"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {isArabic ? story.references.join("، ") : story.references.join(", ")}
            </p>
          </section>
          {narrative.sources && narrative.sources.length > 0 && (
            <section className="mt-5">
              <h2 className="text-sm font-bold text-amber-800">
                {isArabic ? "مصادر الأحاديث والتفسير" : "Hadith and tafsir sources"}
              </h2>
              <ul className="mt-2 space-y-1 text-sm leading-7">
                {narrative.sources.map((source) => (
                  <li key={source.href}>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-800 underline underline-offset-2 hover:text-amber-950"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <aside className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-7 text-slate-700">
            {isArabic
              ? "هذه إعادة سرد وليست نصًا قرآنيًا. القرآن هو الأصل، ولا تُضاف التفاصيل المساندة إلا إذا استندت إلى حديث صحيح أو تفسير معتبر. لا تسرد المصادر كل تفاصيل حياة كل شخصية أو ترتيب جميع الأحداث؛ لذلك لا نملأ ما سكتت عنه بتفاصيل غير موثقة."
              : "This is a retelling, not Quranic text. The Quran is the foundation; supporting details are included only when grounded in authenticated hadith or reliable tafsir. The sources do not record every life detail or the full chronology, so unverified gaps are not filled in."}
          </aside>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
          >
            {isArabic ? "شاهد فيديو القصة على YouTube ▶" : "Watch the story video on YouTube ▶"}
          </a>
        </article>
        <nav aria-label={isArabic ? "التنقل بين القصص" : "Story navigation"} className="mt-5 flex items-center justify-between gap-3">
          {previousStory ? (
            <Link
              href={`/quran-stories/${previousStory.id}`}
              className="rounded-full border border-amber-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-amber-800 transition hover:bg-amber-50"
            >
              {isArabic ? `← السابق: ${previousStory.titleAr}` : `← Previous: ${previousStory.titleEn}`}
            </Link>
          ) : <span />}
          {nextStory ? (
            <Link
              href={`/quran-stories/${nextStory.id}`}
              className="rounded-full bg-amber-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
            >
              {isArabic ? `التالي: ${nextStory.titleAr} →` : `Next: ${nextStory.titleEn} →`}
            </Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}
