import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type BusinessContext = {
  business: {
    name: string;
    industry: string | null;
    description: string | null;
    website: string | null;
  };
  leads: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    message: string | null;
    source: string | null;
    status: string | null;
    priority: string | null;
    aiScore: number | null;
    aiSummary: string | null;
    createdAt: Date | string | null;
  }[];
  customers: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: string | null;
    notes: string | null;
  }[];
  automations: {
    id: string;
    name: string | null;
    trigger: string | null;
    action: string | null;
    enabled: boolean | null;
    description: string | null;
  }[];
  integrations: {
    provider: string;
    name: string | null;
    status: string;
  }[];
};

function buildBusinessSnapshot(context?: BusinessContext): string {
  if (!context) return "No business data available.";

  const parts: string[] = [];

  /* Business info */
  parts.push(`Business: ${context.business.name}`);
  if (context.business.industry)
    parts.push(`Industry: ${context.business.industry}`);
  if (context.business.description)
    parts.push(`Description: ${context.business.description}`);

  /* Counts */
  parts.push("");
  parts.push(`Total Leads: ${context.leads.length}`);
  parts.push(`Total Customers: ${context.customers.length}`);
  parts.push(`Total Automations: ${context.automations.length}`);

  /* Lead details (up to 20 for context window) */
  if (context.leads.length > 0) {
    parts.push("");
    parts.push("LEAD DETAILS:");
    context.leads.slice(0, 20).forEach((l, i) => {
      parts.push(
        `  ${i + 1}. ${l.name || "Unknown"} | ${l.email || "N/A"} | ` +
          `Status: ${l.status || "N/A"} | Source: ${l.source || "N/A"} | ` +
          `Priority: ${l.priority || "N/A"} | Score: ${l.aiScore ?? "N/A"}`
      );
    });
    if (context.leads.length > 20)
      parts.push(`  ... and ${context.leads.length - 20} more`);
  }

  /* Customer details */
  if (context.customers.length > 0) {
    parts.push("");
    parts.push("CUSTOMER DETAILS:");
    context.customers.slice(0, 20).forEach((c, i) => {
      parts.push(
        `  ${i + 1}. ${c.name || "Unknown"} | ${c.email || "N/A"} | ` +
          `Status: ${c.status || "N/A"} | Company: ${c.company || "N/A"}`
      );
    });
    if (context.customers.length > 20)
      parts.push(`  ... and ${context.customers.length - 20} more`);
  }

  /* Automations */
  if (context.automations.length > 0) {
    parts.push("");
    parts.push("AUTOMATIONS:");
    context.automations.forEach((a, i) => {
      parts.push(
        `  ${i + 1}. ${a.name || "Unnamed"} | ` +
          `Trigger: ${a.trigger || "N/A"} | ` +
          `Enabled: ${a.enabled ? "Yes" : "No"}`
      );
    });
  }

  /* Integrations */
  parts.push("");
  parts.push("CONNECTED INTEGRATIONS:");
  if (context.integrations.length > 0) {
    context.integrations.forEach((int) => {
      parts.push(`  - ${int.provider} (${int.name || ""}): ${int.status}`);
    });
  } else {
    parts.push("  - None");
  }

  return parts.join("\n");
}

export async function generateAIResponse(
  messages: ChatMessage[],
  context?: BusinessContext
) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const businessSnapshot = buildBusinessSnapshot(context);

  const systemPrompt = `You are **Autozip AI**, a concise and friendly AI Business Operations Assistant.

═══ CURRENT BUSINESS SNAPSHOT ═══
${businessSnapshot}
═══════════════════════════════════

RESPONSE FORMATTING RULES (VERY IMPORTANT — follow these strictly):

1. **Be concise.** Keep responses SHORT and scannable. Aim for under 300 words unless the user asks for a deep dive.
2. **Use clear headings.** Use ## for main sections and ### for subsections. Never use # (h1).
3. **Use short bullet points** instead of long paragraphs. Each bullet should be 1-2 sentences max.
4. **Tables should be small and focused.** Use tables only when comparing 3+ items across 2-3 columns. Never create tables with more than 5 columns.
5. **Use bold** for key terms and important numbers. Use \`code\` for field names, API endpoints, or technical terms.
6. **Use numbered lists** only for sequential steps (1, 2, 3...). Use bullet points for non-sequential items.
7. **Use horizontal rules (---)** sparingly — only between major sections.
8. **Use emoji sparingly** — one emoji per section heading max. Don't put emoji in every bullet point.
9. **Start with a one-line summary** that directly answers the user's question before diving into details.
10. **Use blockquotes (>)** for important callouts or tips — limit to one per response.

CONTENT RULES:

1. Use the business snapshot above when answering. Reference specific data.
2. Never invent or fabricate business data.
3. If data is missing, say so briefly and suggest how to add it.
4. Give practical, actionable recommendations.
5. For automations, briefly cover: name, trigger, actions, and expected outcome.
6. Do not claim an automation exists unless it appears in the snapshot above.
7. When the user asks "what next," give 3 concrete steps max.

Your tone should be like a smart colleague giving quick, actionable advice — not a textbook.`.trim();

  const response = await groq.chat.completions.create({
    model:
      process.env.GROQ_MODEL ||
      "openai/gpt-oss-120b",

    messages: [
      {
        role: "system",
        content: systemPrompt,
      },

      ...messages,
    ],

    temperature: 0.4,
  });

  return (
    response.choices[0]?.message?.content ||
    "I couldn't generate a response."
  );
}