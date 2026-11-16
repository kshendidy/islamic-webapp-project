import { Receiver } from "@upstash/qstash";
import { PrayerAlertError, processPrayerAlertQueue } from "@/lib/prayer-alerts";

export const runtime = "nodejs";

function getQStashReceiver() {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!currentSigningKey || !nextSigningKey) {
    throw new PrayerAlertError("Prayer notification scheduler is not configured.", 503);
  }
  return new Receiver({ currentSigningKey, nextSigningKey, devMode: false });
}

function getQStashDestinationUrl() {
  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (!productionDomain) {
    throw new PrayerAlertError("The production domain is not configured.", 503);
  }
  return new URL("/api/prayer-alerts/cron", `https://${productionDomain}`).toString();
}

export async function POST(request: Request) {
  try {
    const receiver = getQStashReceiver();
    const signature = request.headers.get("upstash-signature");
    if (!signature) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.text();
    const url = getQStashDestinationUrl();
    let isValid: boolean;
    try {
      isValid = await receiver.verify({ signature, body, url });
    } catch (error) {
      console.warn("Prayer scheduler rejected an invalid QStash signature.", error);
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!isValid) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    return Response.json(await processPrayerAlertQueue());
  } catch (error) {
    if (error instanceof PrayerAlertError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Prayer notification scheduler failed.", error);
    return Response.json({ error: "Prayer notification scheduler failed." }, { status: 500 });
  }
}
