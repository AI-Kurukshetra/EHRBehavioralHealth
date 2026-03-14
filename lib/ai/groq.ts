import "server-only";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const getGroqApiKey = () => process.env.GROQ_API_KEY;

export const generateClinicalNoteSummary = async (content: string) => {
  const apiKey = getGroqApiKey();

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.3,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content:
              "You summarize behavioral health session notes. Return a concise, neutral 1-2 sentence summary suitable for an EHR. Do not invent details. Do not include bullet points.",
          },
          {
            role: "user",
            content,
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
};
