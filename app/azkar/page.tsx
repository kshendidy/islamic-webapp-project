import type { Metadata } from "next";
import AzkarLibrary from "./azkar-library";

export const metadata: Metadata = {
  title: "الأذكار | مستكشف القرآن",
  description: "أذكار الصباح والمساء وبعد الصلاة والنوم ومواقف اليوم مع المصادر.",
};

export default function AzkarPage() {
  return <AzkarLibrary />;
}
