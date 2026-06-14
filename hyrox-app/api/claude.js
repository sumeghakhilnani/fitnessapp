// /api/claude — server-side proxy to Anthropic. The API key NEVER reaches the browser.
// Strava data is fetched by the frontend and passed in; we don't use MCP here
// (MCP connectors are a Claude-app feature). Instead the frontend hands Claude the
// already-fetched Strava JSON and Claude reasons over it.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Server missing ANTHROPIC_API_KEY" });

  try {
    const { system, messages, max_tokens = 1500, web_search = false } = req.body || {};
    const body = {
      model: "claude-sonnet-4-6",
      max_tokens,
      messages,
    };
    if (system) body.system = system;
    if (web_search) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || "Anthropic error" });

    // flatten to text
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return res.status(200).json({ text, raw: data.content });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
