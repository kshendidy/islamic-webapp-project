import { PrayerAlertError, processPrayerAlertQueue } from "@/lib/prayer-alerts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "Prayer notification scheduler is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    return Response.json(await processPrayerAlertQueue());
  } catch (error) {
    if (error instanceof PrayerAlertError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Prayer notification scheduler failed.", error);
    return Response.json({ error: "Prayer notification scheduler failed." }, { status: 500 });
  }
}
