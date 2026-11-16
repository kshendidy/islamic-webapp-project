import type { Metadata } from "next";
import QiblaFinder from "./qibla-finder";

export const metadata: Metadata = {
  title: "اتجاه القبلة | مستكشف القرآن",
  description: "حدد اتجاه القبلة من موقعك باستخدام بوصلة تفاعلية.",
};

export default function QiblaPage() {
  return <QiblaFinder />;
}
