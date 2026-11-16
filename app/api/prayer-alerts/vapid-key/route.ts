import { PrayerAlertError, getPublicVapidKey } from "@/lib/prayer-alerts";

export const runtime = "nodejs";

export function GET() {
  try {
    return Response.json({ publicKey: getPublicVapidKey() });
  } catch (error) {
    if (error instanceof PrayerAlertError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Could not load the prayer notification key.", error);
    return Response.json({ error: "Could not load notification settings." }, { status: 500 });
  }
}
