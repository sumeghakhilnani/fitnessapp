// /api/strava — handles the Strava OAuth handshake and token refresh.
// Client secret stays server-side. The frontend calls:
//   POST /api/strava { action: "exchange", code }      -> after user authorises
//   POST /api/strava { action: "refresh", refresh_token } -> when access token expires
//   POST /api/strava { action: "proxy", access_token, path, query } -> read Strava API

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Server missing STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET" });
  }

  const { action } = req.body || {};

  try {
    if (action === "exchange" || action === "refresh") {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: action === "exchange" ? "authorization_code" : "refresh_token",
      });
      if (action === "exchange") params.set("code", req.body.code);
      else params.set("refresh_token", req.body.refresh_token);

      const r = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data?.message || "Strava OAuth error" });
      // return only what the client needs
      return res.status(200).json({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        athlete: data.athlete || null,
      });
    }

    if (action === "proxy") {
      const { access_token, path, query } = req.body;
      if (!access_token || !path) return res.status(400).json({ error: "Need access_token + path" });
      const qs = query ? "?" + new URLSearchParams(query).toString() : "";
      const r = await fetch(`https://www.strava.com/api/v3${path}${qs}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data?.message || "Strava API error" });
      return res.status(200).json({ data });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
