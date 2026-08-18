type DeepSeekResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export async function structuredResponse<T>(
  name: string,
  schema: Record<string, unknown>,
  instructions: string,
  input: string,
): Promise<T | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;

  const baseUrl = trimTrailingSlash(
    process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  );
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const systemPrompt = `${instructions}\nReturn JSON only. The response must satisfy this JSON Schema named ${name}:\n${JSON.stringify(schema)}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              attempt === 0
                ? input
                : `${input}\n\nThe previous response was empty or invalid. Return one complete JSON object only.`,
          },
        ],
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as DeepSeekResponse;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) continue;

    try {
      const parsed = JSON.parse(content) as T;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // DeepSeek JSON mode can occasionally return incomplete output; retry once.
    }
  }

  return null;
}
