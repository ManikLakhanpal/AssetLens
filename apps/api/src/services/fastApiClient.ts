import axios from "axios";

const FASTAPI_BASE_URL = (process.env.FASTAPI_BASE_URL ?? "http://localhost:8000")
  .replace(/\/$/, "");

const client = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 120_000,
});

type Model = "chatgpt" | "gemini";

export const fastApiClient = {
  async summarize(args: { snapshot: unknown; model: Model }) {
    const res = await client.post("/summarize", {
      snapshot: args.snapshot,
      model: args.model,
    });
    return res.data as { summary: string };
  },

  async chat(args: {
    message: string;
    model: Model;
    history: Array<{ role: "user" | "assistant"; content: string }>;
    portfolio_summary?: string;
  }) {
    const res = await client.post("/chat", {
      message: args.message,
      model: args.model,
      history: args.history,
      portfolio_summary: args.portfolio_summary,
    });
    return res.data as { reply: string };
  },
};

