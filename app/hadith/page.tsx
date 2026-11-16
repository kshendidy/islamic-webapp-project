import type { Metadata } from "next";
import HadithLibrary from "./hadith-library";

export const metadata: Metadata = {
  title: "الأحاديث | مستكشف القرآن",
  description: "تصفح الأحاديث من الكتب الستة مع النص العربي والترجمة والمراجع.",
};

export default function HadithPage() {
  return <HadithLibrary />;
}
