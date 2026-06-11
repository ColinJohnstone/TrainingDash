# Connecting your real Strava data

The Strava Metrics page pulls your actual completed activities through a small
serverless function (`api/activities.ts`). Your Strava **client secret** and
**refresh token** live only on the server (as environment variables) and never
reach the browser.

This is a one-time setup (~10 minutes).

---

## 1. Register a Strava API application

1. Go to <https://www.strava.com/settings/api>
2. Fill in the form (any values work for a personal app):
   - **Application Name:** `TrainingDash` (or anything)
   - **Category:** `Training`
   - **Website:** your Vercel URL, or `http://localhost`
   - **Authorization Callback Domain:** `localhost`
     *(just the domain — no `http://`, no path. `localhost` is fine even for
     production because the callback is only used during this one-time setup.)*
3. Click **Create**. You'll now see:
   - **Client ID** (a number)
   - **Client Secret** (a long string)

Keep these handy.

---

## 2. Authorize your own account (one time) to get a code

Open this URL in your browser, replacing `YOUR_CLIENT_ID`:

```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all
```

Click **Authorize**. Your browser will redirect to a `http://localhost/?...`
URL that fails to load — **that's expected**. Copy the `code` value out of the
address bar:

```
http://localhost/?state=&code=THE_CODE_YOU_WANT&scope=read,activity:read_all
                          ^^^^^^^^^^^^^^^^^^^^^
```

---

## 3. Exchange the code for a refresh token

Run this in a terminal, filling in your Client ID, Client Secret, and the code
from step 2:

```bash
curl -X POST https://www.strava.com/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=THE_CODE_FROM_STEP_2 \
  -d grant_type=authorization_code
```

The JSON response contains a **`refresh_token`** — copy it. (The `access_token`
in the response expires in 6 hours; the app uses the long-lived refresh token to
mint fresh ones automatically, so you only need the refresh token.)

---

## 4. Set the environment variables

**Production (Vercel):**
Project → **Settings** → **Environment Variables**, add all three for the
Production (and Preview) environment:

| Name                   | Value                       |
| ---------------------- | --------------------------- |
| `STRAVA_CLIENT_ID`     | from step 1                 |
| `STRAVA_CLIENT_SECRET` | from step 1                 |
| `STRAVA_REFRESH_TOKEN` | from step 3                 |

Then **redeploy** so the function picks them up.

**Local development:**
Copy `.env.example` to `.env`, fill in the three values, and run the app with
the Vercel CLI (plain `npm run dev` / Vite does **not** run the `/api`
functions):

```bash
npm i -g vercel   # once
vercel dev        # serves the frontend AND the /api function together
```

---

## 5. Lock it down to just you (Vercel Authentication)

Vercel Project → **Settings** → **Deployment Protection** → enable
**Vercel Authentication**. Only Vercel accounts you've added to the project can
load the site — and because the dashboard fetches `/api/activities` from the
same origin, the data endpoint is protected too. No code required.

---

## Done

Open the **Strava Metrics** page and click **Refresh**. You should see your most
recent workout and your real all-time / this-week totals.

### Scopes / privacy notes
- `activity:read_all` lets the app read your activities, including ones marked
  private on Strava. Use `activity:read` instead if you only want public ones.
- The refresh token grants ongoing read access to your Strava account. Treat it
  like a password. You can revoke it anytime at
  <https://www.strava.com/settings/apps>.
