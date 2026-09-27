import Groq from "groq-sdk";
import { z } from "zod";

const LeadQualificationSchema = z.object({
  score: z.number().min(0).max(100),

  priority: z.enum([
    "low",
    "medium",
    "high",
    "urgent",
  ]),

  summary: z.string(),

  response: z.string(),
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type LeadQualification = {
  score: number;
  priority: "low" | "medium" | "high" | "urgent";
  summary: string;
  response: string;
};

export async function qualifyLead(input: {
  name: string;
  email?: string;
  company?: string;
  message?: string;
}) {
  const prompt = `
You are an AI sales qualification assistant.

Analyze the following business lead.

Lead name:
${input.name}

Email:
${input.email ?? "Not provided"}

Company:
${input.company ?? "Not provided"}

Message:
${input.message ?? "No message provided"}

Return a JSON object with exactly these fields:

{
  "score": number,
  "priority": "low" | "medium" | "high" | "urgent",
  "summary": string,
  "response": string
}

Scoring rules:

0-30   = low
31-60  = medium
61-80  = high
81-100 = urgent

Consider:

- buying intent
- budget information
- urgency
- clarity of requirements
- potential business value

The response should be professional and suitable to send directly to the lead.
`;

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    temperature: 0.2,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content:
          "You are a professional B2B sales qualification assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response.");
  }

  const parsed = JSON.parse(content);

const result = LeadQualificationSchema.parse(parsed);

return result;
}