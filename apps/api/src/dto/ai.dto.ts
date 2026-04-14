export type Model = "chatgpt" | "gemini";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
