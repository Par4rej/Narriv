import OpenAI from "openai";

function extractFirstJsonObject(text) {
  if (!text) return null;
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1 || e <= s) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Uses OpenAI Responses API (recommended for new builds)
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: prompt,
      // Optional: enable built-in web search later (we can add this next)
      // tools: [{ type: "web_search_preview_2025_03_11", search_context_size: "medium" }],
    });

    const text = response.output_text || "";
    const parsed = extractFirstJsonObject(text);

    if (!parsed) {
      return res.status(500).json({
        error: "Model did not return valid JSON",
        raw: text.slice(0, 4000),
      });
    }

    return res.status(200).json({
      result: parsed,
      debug: { api: "openai", model: process.env.OPENAI_MODEL || "gpt-4o-mini" },
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
