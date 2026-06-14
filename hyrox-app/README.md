# Hyrox Trainer — your standalone phone app

A personal Hyrox + running tracker: daily session analyzer, goals & plan, coach chat, and a recovery dashboard. Frontend is React (Vite); the backend is two Vercel serverless functions that keep your API keys safe and talk to Strava + Claude.

You do **not** need a terminal. Everything below is done in a browser.

---

## What you'll need (3 free signups + 1 pay-as-you-go key)

1. **GitHub** account — github.com
2. **Vercel** account — vercel.com (sign in with GitHub)
3. **Anthropic API key** — console.anthropic.com (this is *separate* from your Claude subscription; it's pay-as-you-go, fractions of a cent per analyze/chat call — set a low spend cap)
4. **Strava API app** — strava.com/settings/api (free)

---

## Step 1 — Get your Anthropic API key
1. Go to **console.anthropic.com** → sign in.
2. Left menu → **API Keys** → **Create Key**. Name it "hyrox". Copy the `sk-ant-...` value somewhere safe.
3. **Billing** → add a payment method and set a **monthly spend limit** (e.g. $5) so it can never surprise you.

## Step 2 — Create your Strava API app
1. Go to **strava.com/settings/api**.
2. Fill in: Application Name `Hyrox Trainer`, Category `Training`, Website `http://localhost` (temporary), **Authorization Callback Domain**: `localhost` for now (you'll change this in Step 6).
3. Create it. Note your **Client ID** and **Client Secret**.

## Step 3 — Put the code on GitHub (no terminal)
1. Download the project zip I gave you and unzip it.
2. Go to **github.com/new** → create a repo called `hyrox-trainer` (Private is fine). Don't add a README.
3. On the new empty repo page, click **uploading an existing file**.
4. Drag in **all the files and folders** from the unzipped project (the `src`, `api`, `public` folders plus `package.json`, `vite.config.js`, `index.html`, `vercel.json`, `.gitignore`). Commit.

## Step 4 — Import to Vercel
1. Go to **vercel.com/new** → **Import** your `hyrox-trainer` repo.
2. Framework preset should auto-detect **Vite**. Leave build settings as-is.
3. Before clicking Deploy, expand **Environment Variables** and add these four:

   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | your `sk-ant-...` key |
   | `STRAVA_CLIENT_ID` | your Strava Client ID |
   | `STRAVA_CLIENT_SECRET` | your Strava Client Secret |
   | `VITE_STRAVA_CLIENT_ID` | your Strava Client ID (same number again) |

4. Click **Deploy**. After ~1 minute you'll get a live URL like `https://hyrox-trainer-xxxx.vercel.app`.

## Step 5 — Point Strava back at your live app
1. Copy your Vercel domain (just the host, e.g. `hyrox-trainer-xxxx.vercel.app`).
2. Back on **strava.com/settings/api**, set **Authorization Callback Domain** to exactly that host (no `https://`, no trailing slash). Save.

## Step 6 — Open it and connect Strava
1. Open your Vercel URL on your phone.
2. Tap **Connect with Strava** → authorise. It redirects back and you're in.

## Step 7 — Add to Home Screen
- **iPhone (Safari):** Share button → **Add to Home Screen**.
- **Android (Chrome):** ⋮ menu → **Install app** / **Add to Home Screen**.

You now have a real app icon that opens straight to your tracker — no Claude needed.

---

## Using it
- **Analyze** — tap any recent session for a full coach breakdown (splits, drift, vs last similar, plan + goal read, next actions).
- **Goals** — Delhi + KTM preloaded; add more with **+ Add Goal**. Full 14-week plan below, current week highlighted.
- **Coach** — chat about any session or fitness in general; pulls your recent Strava as context.
- **Recovery** — live Strava volume + station progress. Garmin metrics: tap **Sync** to enter HRV/readiness/sleep from your watch (Garmin has no public API, so this part is manual — 20 seconds).

## Notes on cost & data
- Each Analyze or Coach message is one Claude API call — typically well under a cent. The spend cap from Step 1.3 is your safety net.
- Your Strava tokens and goals live in your phone's browser storage. Your keys live only on Vercel's servers, never in the browser.
- Want a Garmin auto-pull later? It needs Garmin's developer program (approval required) or a third-party bridge — ask and I'll wire it in.

## Updating the app later
Edit a file on GitHub (pencil icon) and commit — Vercel redeploys automatically. Or ask me for changes and re-upload the files.
