import {
  deletePrayerSubscription,
  parsePrayerAlertSettings,
  parsePushEndpoint,
  PrayerAlertError,
  savePrayerSubscription,
} from "@/lib/prayer-alerts";

export const runtime = "nodejs";

function isSameOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0] ??
    new URL(request.url).protocol.slice(0, -1);
  if (!originHeader || !host) return false;

  try {
    const origin = new URL(originHeader);
    return origin.host.toLowerCase() === host.toLowerCase() && origin.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

function invalidBody() {
  return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
}

function errorResponse(error: unknown) {
  if (error instanceof PrayerAlertError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Prayer notification subscription request failed.", error);
  return Response.json({ error: "Could not update prayer notifications." }, { status: 500 });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request origin was not allowed." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Request must use JSON." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 8192) {
    return Response.json({ error: "Request body is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const settings = parsePrayerAlertSettings(body);
    await savePrayerSubscription(settings);
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Request origin was not allowed." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Request must use JSON." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 8192) {
    return Response.json({ error: "Request body is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    if (typeof body !== "object" || body === null || !("endpoint" in body)) {
      throw new PrayerAlertError("Invalid notification subscription.", 400);
    }
    const endpoint = parsePushEndpoint(body.endpoint);
    await deletePrayerSubscription(endpoint);
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
