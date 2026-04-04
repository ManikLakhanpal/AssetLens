import { Router } from "express";
import { collectPortfolioSnapshot } from "../services/portfolio/portfolioSnapshotService";
import { buildPortfolioContextMarkdown } from "../services/portfolio/portfolioContextMarkdown";
import { fastApiClient } from "../services/fastApiClient";

type Model = "chatgpt" | "gemini";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const router = Router();

router.post("/portfolio-summary", async (req, res) => {
  try {
    const model = (req.body?.model as Model | undefined) ?? "chatgpt";
    const snapshot = await collectPortfolioSnapshot();

    const data = await fastApiClient.summarize({
      snapshot,
      model,
    });

    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const model = req.body?.model as Model;
    if (model !== "chatgpt" && model !== "gemini") {
      res.status(400).json({ error: "model must be 'chatgpt' or 'gemini'" });
      return;
    }

    const message = req.body?.message as string | undefined;
    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const history = (req.body?.history ?? []) as ChatMessage[];

    const snapshot = await collectPortfolioSnapshot();
    const portfolio_context_markdown = buildPortfolioContextMarkdown(snapshot);

    const data = await fastApiClient.chat({
      message,
      model,
      history,
      portfolio_context_markdown,
    });

    res.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export default router;

