import axios from "axios";
import type { Model, ChatMessage } from "../dto/ai.dto";

export type { Model, ChatMessage };

const FASTAPI_BASE_URL = (process.env.FASTAPI_BASE_URL ?? "http://localhost:8000")
  .replace(/\/$/, "");

const client = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 120_000,
});

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
    history: ChatMessage[];
    portfolio_context_markdown: string;
  }) {
    const res = await client.post("/chat", {
      message: args.message,
      model: args.model,
      history: args.history,
      portfolio_context_markdown: args.portfolio_context_markdown,
    });
    return res.data as { reply: string };
  },
};

