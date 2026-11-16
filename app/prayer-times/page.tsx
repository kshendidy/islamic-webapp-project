import type { Metadata } from "next";
import PrayerTimesView from "./prayer-times-view";

export const metadata: Metadata = {
  title: "مواقيت الصلاة | مستكشف القرآن",
  description: "مواقيت الصلاة اليومية حسب موقعك وطريقة الحساب التي تختارها.",
};

export default function PrayerTimesPage() {
  return <PrayerTimesView />;
}
