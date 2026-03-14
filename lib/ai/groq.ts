import "server-only";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const getGroqApiKey = () => process.env.GROQ_API_KEY;

const getMessageContent = async (response: Response) => {
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() || null;
};

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

    return await getMessageContent(response);
  } catch {
    return null;
  }
};

export const generatePatientFriendlyExplanation = async ({
  title,
  content,
  type,
}: {
  title: string;
  content: string;
  type: "note" | "treatment-plan";
}) => {
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
        temperature: 0.4,
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content:
              "You explain behavioral health care information to patients in simple, warm language. Return markdown with exactly these sections: '## Simple explanation' and '## Helpful next steps'. Keep it reassuring, avoid jargon, do not diagnose, do not promise a cure, and only use details present in the source text.",
          },
          {
            role: "user",
            content: `Type: ${type}\nTitle: ${title}\nSource:\n${content}`,
          },
        ],
      }),
    });

    return await getMessageContent(response);
  } catch {
    return null;
  }
};
