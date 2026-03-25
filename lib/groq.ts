import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function generateContent(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a senior broadcast journalist. Respond with valid JSON only. No markdown, no code blocks, no extra text. Your narrations must be detailed, specific, and information-dense — never vague or generic.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8192,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as T;
}
