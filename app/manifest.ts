import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مستكشف القرآن ومواقيت الصلاة",
    short_name: "مواقيت الصلاة",
    description: "مواقيت الصلاة وتنبيهاتها حسب موقعك.",
    start_url: "/prayer-times",
    display: "standalone",
    background_color: "#fffbeb",
    theme_color: "#78350f",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "256x256",
        type: "image/x-icon",
      },
    ],
  };
}
