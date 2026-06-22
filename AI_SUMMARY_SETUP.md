# AI workout summary setup (Groq — free)

The "Coach's notes" card on Home uses **Groq** (free tier, no credit card) to
generate a short AI summary of your recent training. The `/api/summary`
function calls Groq with your stats; your API key stays server-side and the
endpoint is gated behind your app password.

One-time setup (~2 minutes):

## 1. Get a free Groq API key
1. Go to <https://console.groq.com> and sign up (Google/GitHub login, no card).
2. **API Keys** → **Create API Key** → copy it (starts with `gsk_...`).

## 2. Add it to Vercel
Project → **Settings** → **Environment Variables** → add for **all environments**:

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | the `gsk_...` key from step 1 |

## 3. Redeploy
Trigger a redeploy (push a commit, or the Redeploy button) so the function
picks up the key.

## 4. Done
Open **Home** → the "Coach's notes" card generates a summary. It's **cached per
week** (regenerates automatically each week) and has a **Regenerate** button for
an on-demand refresh — so you stay well within Groq's free limits.

## Notes
- Model: `llama-3.3-70b-versatile`. To change it, edit `MODEL` in
  `api/summary.ts`.
- Only a compact digest of your numbers is sent (weekly totals, recent
  activities, streak, next race) — not your full history.
- Free-tier rate limits are generous for personal use; the weekly cache means
  you'll rarely make more than a handful of calls.
