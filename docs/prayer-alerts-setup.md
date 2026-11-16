# Prayer alerts deployment setup

Background prayer notifications use Upstash QStash for scheduling, so Vercel Hobby is sufficient. The two-minute schedule runs about 720 times per day, within QStash's free 1,000-message daily quota. Delivery can be up to two minutes late; retries also count toward the quota. QStash Pay-as-you-go supports a one-minute schedule at $1 per 100,000 messages. Do not commit or share private keys.

1. Create an Upstash Redis database and copy its REST URL and REST token.
2. Generate a VAPID key pair with `npx web-push generate-vapid-keys`. Keep the private key secret.
3. In the Upstash Console, open QStash and copy its current and next signing keys.
4. Ensure Vercel's system environment variables are enabled, then add the values below to the project's Production environment variables and redeploy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (a contact such as `mailto:admin@example.com`)
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`
5. In QStash, create a schedule that sends a POST request to `https://<your-production-domain>/api/prayer-alerts/cron` every two minutes (`*/2 * * * *`). The request body can be `{}`. QStash signs each request; the route verifies the signature before processing the queue. Create the schedule after deploying and configuring the environment variables.

Do not use a Vercel Cron entry for this job: Vercel Hobby allows only daily cron jobs. Keep the QStash schedule pointed at the stable production domain, not a deployment-specific preview URL.

Users must explicitly grant notification permission and consent to storing rounded coordinates and their push subscription. They can remove that stored data by unsubscribing. The browser's notification sound is controlled by the device; the bundled Adhan audio can only play while the page is open and the user has enabled audio.

The bundled 42-second recording is by Aishatu98 from Wikimedia Commons and is dedicated under CC0 1.0. See `public/audio/ATTRIBUTION.txt`.
