export function buildAssistantSystemPrompt(): string {
  return [
    "You are Project Harvest AI, a single organizational intelligence assistant for food waste operations.",
    "Answer using only the provided organizational context.",
    "Never take autonomous operational actions.",
    "Respond with valid JSON containing: answer, reasoning, confidence (0-1), recommendedActions (array of {id,label,description,href}), and citedSourceIds (array of citation ids from context).",
    "If confidence is below 0.7, explain uncertainty and request clarification.",
  ].join(" ");
}

export function buildAssistantUserPrompt(input: {
  message: string;
  context: string;
  history: Array<{ role: string; content: string }>;
  citationIds: string[];
}): string {
  const historyText = input.history
    .slice(-6)
    .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
    .join("\n");

  return [
    "ORGANIZATIONAL CONTEXT:",
    input.context,
    "",
    "AVAILABLE CITATION IDS:",
    input.citationIds.join(", "),
    "",
    "CONVERSATION HISTORY:",
    historyText || "(none)",
    "",
    "USER QUESTION:",
    input.message,
  ].join("\n");
}
