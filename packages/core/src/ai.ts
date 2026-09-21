/**
 * AI helpers (product copy, SEO). Uses the Anthropic Messages API when ANTHROPIC_API_KEY is set,
 * otherwise falls back to a deterministic template so the feature still works in dev.
 */
const MODEL = "claude-haiku-4-5-20251001";

async function complete(prompt: string, maxTokens = 800): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return data.content?.find((c) => c.type === "text")?.text?.trim() ?? null;
}

export async function generateProductDescription(input: { title: string; keywords?: string; tone?: string; language?: "en" | "bn" }): Promise<string> {
  const lang = input.language === "bn" ? "Bangla" : "English";
  const out = await complete(
    `Write a persuasive e-commerce product description in ${lang} for "${input.title}". ` +
      `Tone: ${input.tone ?? "friendly and trustworthy"}. Keywords: ${input.keywords ?? "none"}. ` +
      `Return clean HTML only: one <p> intro (2 sentences) followed by a <ul> of 4-5 benefit bullets. No markdown, no preamble.`,
  );
  if (out) return out;
  return `<p>Meet the <strong>${input.title}</strong> — crafted for everyday use and built to last. Quality you can feel, at a price you'll love.</p><ul><li>Premium materials and careful finishing</li><li>Designed for comfort and convenience</li><li>Quality-checked before dispatch</li><li>Fast delivery across the country</li><li>Easy returns within 7 days</li></ul>`;
}

export async function generateSeo(input: { title: string; description?: string }): Promise<{ title: string; description: string }> {
  const out = await complete(
    `Create SEO metadata for a product page. Product: "${input.title}". Details: ${input.description?.slice(0, 600) ?? ""}. ` +
      `Respond as JSON {"title": string (max 60 chars), "description": string (max 155 chars)} and nothing else.`,
    300,
  );
  try {
    if (out) return JSON.parse(out.replace(/^```json|```$/g, ""));
  } catch {}
  return { title: input.title.slice(0, 60), description: `Buy ${input.title} online at the best price. Fast delivery, cash on delivery & easy returns.`.slice(0, 155) };
}
