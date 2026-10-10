export type MessageLike = {
  role: string;
  content: string;
};

export type ConversationLike = {
  id?: string;
  messages?: MessageLike[];
  [key: string]: any;
};

/**
 * Strips markdown symbols, headers, tables, emojis, and artifacts
 * to produce clean, plain text.
 */
function cleanMarkdownText(text: string): string {
  if (!text) return "";

  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove markdown links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove markdown images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, " ")
    // Remove markdown blockquotes
    .replace(/^>\s*/gm, "")
    // Remove markdown headers #, ##, ###
    .replace(/^#+\s*/gm, "")
    // Remove markdown bold and italic: **text**, *text*, __text__, _text_
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove markdown table syntax (pipes, separators)
    .replace(/\|/g, " ")
    .replace(/-{3,}/g, " ")
    // Remove list markers
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^\d+[\.)]\s+/gm, "")
    // Remove AI response tag prefixes like "✅ Quick Answer", "Quick Answer", etc.
    .replace(/^[✅✨⚡💡📌📝ℹ️]?\s*(quick answer|answer|note|overview|current state)\s*[:-]?\s*/i, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formats a raw user query or conversation into a user-understandable question format.
 */
export function formatConversationQuestion(convOrMessages: ConversationLike | MessageLike[]): string {
  let messages: MessageLike[] = [];

  if (Array.isArray(convOrMessages)) {
    messages = convOrMessages;
  } else if (convOrMessages && Array.isArray(convOrMessages.messages)) {
    messages = convOrMessages.messages;
  }

  if (!messages || messages.length === 0) {
    return "New Conversation";
  }

  // 1. Find user messages
  const userMessages = messages.filter(
    (m) => m && typeof m.content === "string" && m.role?.toLowerCase() === "user"
  );

  const greetingRegex = /^(hi|hii|hello|hey|hey there|yo|good morning|good afternoon|good evening|test|start)\b[!?.]*$/i;

  let rawSubject = "";

  if (userMessages.length > 0) {
    // Look for the latest meaningful question/inquiry (not just "hi" or "hello")
    const meaningful = [...userMessages].reverse().find(
      (m) => !greetingRegex.test(m.content.trim())
    );
    rawSubject = meaningful ? meaningful.content : userMessages[0].content;
  } else {
    // If no user messages exist, inspect the assistant's first response
    rawSubject = messages[0]?.content || "";
  }

  // 2. Clean out markdown & artifacts
  let clean = cleanMarkdownText(rawSubject);

  if (!clean) {
    return "New Conversation";
  }

  // 3. Handle math expressions (e.g. "2+2", "5=5", "10*4", "2+2=4")
  const mathAnswerMatch = clean.match(/^(\d+)\s*([\+\-\*\/])\s*(\d+)\s*=\s*(\d+)/);
  if (mathAnswerMatch) {
    const symbolMap: Record<string, string> = {
      "+": "+",
      "-": "-",
      "*": "×",
      "/": "÷",
    };
    const op = symbolMap[mathAnswerMatch[2]] || mathAnswerMatch[2];
    return `What is ${mathAnswerMatch[1]} ${op} ${mathAnswerMatch[3]}?`;
  }

  const mathMatch = clean.match(/^(\d+)\s*([\+\-\*\/])\s*(\d+)\s*\??$/);
  if (mathMatch) {
    const symbolMap: Record<string, string> = {
      "+": "+",
      "-": "-",
      "*": "×",
      "/": "÷",
    };
    const op = symbolMap[mathMatch[2]] || mathMatch[2];
    return `What is ${mathMatch[1]} ${op} ${mathMatch[3]}?`;
  }

  const equalityMatch = clean.match(/^(\d+)\s*=\s*(\d+)\s*\??$/);
  if (equalityMatch) {
    return `Is ${equalityMatch[1]} = ${equalityMatch[2]}?`;
  }

  // 4. Handle short greetings
  if (greetingRegex.test(clean)) {
    return "General Greeting";
  }

  // 5. Ensure capitalization of first character
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);

  // 6. Ensure question mark if it begins with an interrogative word
  const questionWords = /^(what|how|why|where|when|who|which|can|could|would|should|is|are|do|does|will|am)\b/i;
  if (questionWords.test(clean) && !clean.endsWith("?") && !clean.endsWith(".")) {
    clean += "?";
  }

  // 7. Limit length cleanly if excessive
  if (clean.length > 80) {
    clean = clean.slice(0, 77).trim() + "...";
  }

  return clean;
}
