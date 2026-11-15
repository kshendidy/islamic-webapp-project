import type { Metadata } from "next";
import QuranStoriesLibrary from "./stories-library";

export const metadata: Metadata = {
  title: "قصص القرآن | مستكشف القرآن",
  description: "قصص قرآنية مبسطة للأطفال، مع الآيات والعبر وروابط فيديوهات مناسبة للمراجعة مع الأسرة.",
};

export default function QuranStoriesPage() {
  return <QuranStoriesLibrary />;
}
