# Prayer alerts deployment setup

Background prayer notifications require Vercel Pro or Enterprise for the once-per-minute schedule, an Upstash Redis database, and VAPID keys. Do not commit or share the private keys.

1. Create an Upstash Redis database and copy its REST URL and REST token.
2. Generate a VAPID key pair with `npx web-push generate-vapid-keys`. Keep the private key secret.
3. Generate a random cron secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
4. Add the values below to the Vercel project's Production environment variables, then redeploy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (a contact such as `mailto:admin@example.com`)
   - `CRON_SECRET`
5. Confirm that the `/api/prayer-alerts/cron` schedule is enabled in Vercel. Its one-minute cadence is required for prayer-time delivery.

Vercel sends `Authorization: Bearer <CRON_SECRET>` with scheduled requests; the cron route rejects requests without that header.

Users must explicitly grant notification permission and consent to storing rounded coordinates and their push subscription. They can remove that stored data by unsubscribing. The browser's notification sound is controlled by the device; the bundled Adhan audio can only play while the page is open and the user has enabled audio.

The bundled 42-second recording is by Aishatu98 from Wikimedia Commons and is dedicated under CC0 1.0. See `public/audio/ATTRIBUTION.txt`.
