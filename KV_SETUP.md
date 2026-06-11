# Race storage setup (Vercel KV)

Your races are stored in **Vercel KV** (a serverless Redis, powered by Upstash)
so they sync across all your devices and persist permanently. The
`api/races.ts` function reads/writes the store; the browser only talks to that
function.

One-time setup (~3 minutes):

## 1. Create the KV store

1. In your Vercel dashboard, open the project → **Storage** tab.
2. Click **Create Database** → choose **KV** (Upstash Redis) → give it a name →
   **Create**.
3. When prompted, **Connect** it to this project (Production + Preview +
   Development).

That's it — Vercel automatically adds the connection environment variables to
the project:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

(The function also accepts the Upstash-native names
`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` if you wire up Upstash
directly instead.)

## 2. Redeploy

Trigger a redeploy (push a commit, or use the **Redeploy** button) so the
function picks up the new env vars.

## 3. Done

Open the **Home** page. On first load the store auto-seeds with your existing
races (Ultra Armor 10K, Sprint Triathlon, Full Marathon, Ironman 70.3). Use
**Add Race** to add more, or the trash icon to remove one — changes are saved
to KV instantly and appear on every device.

## Local development

To exercise the races API locally, pull the env vars and run with the Vercel
CLI (plain `npm run dev` / Vite does **not** run the `/api` functions):

```bash
vercel link        # once, links this folder to the Vercel project
vercel env pull    # writes the KV vars into .env.local
vercel dev         # serves the frontend AND the /api functions
```

## Notes

- The data is gated behind **Vercel Authentication** (your deployment
  protection), so only you can read or modify races through the deployed app.
- Free tier limits (Upstash) are far beyond what a personal race list needs.
