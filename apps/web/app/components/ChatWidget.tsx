"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { api, routes } from "../lib/api";

type Model = "chatgpt" | "gemini";
type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState<Model>("chatgpt");

  const [portfolioSummary, setPortfolioSummary] = useState<string | null>(null);
  const [renderMessages, setRenderMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [input, setInput] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !chatLoading, [input, chatLoading]);

  async function loadPortfolioSummary() {
    setSummaryLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post(routes.ai.portfolioSummary, { model });
      const summary: string = res.data?.summary ?? "";
      setPortfolioSummary(summary);
      setChatHistory([]);
      setRenderMessages([
        {
          role: "assistant",
          content: `Portfolio summary:\n${summary}`,
        },
      ]);
    } catch (e: unknown) {
      const message =
        (e as any)?.response?.data?.error ||
        (e as any)?.message ||
        "Failed to load portfolio summary";
      setErrorMsg(message);
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    if (portfolioSummary) return;
    void loadPortfolioSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [renderMessages.length, chatLoading]);

  async function sendMessage() {
    if (!canSend) return;

    const trimmed = input.trim();
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setRenderMessages((prev) => [...prev, userMsg]);

    const historyToSend = chatHistory;
    setChatLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post(routes.ai.chat, {
        message: trimmed,
        model,
        history: historyToSend,
        portfolio_summary: portfolioSummary ?? undefined,
      });

      const reply: string = res.data?.reply ?? "";
      const assistantMsg: ChatMessage = { role: "assistant", content: reply };
      setRenderMessages((prev) => [...prev, assistantMsg]);
      setChatHistory((prev) => [...prev, userMsg, assistantMsg]);
    } catch (e: unknown) {
      const message =
        (e as any)?.response?.data?.error ||
        (e as any)?.message ||
        "Failed to send message";
      setErrorMsg(message);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg flex items-center justify-center transition-all duration-200"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-xl backdrop-blur-xl overflow-hidden"
          role="dialog"
          aria-label="Portfolio chat"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-slate-800 dark:text-white">Tradeee AI</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                {portfolioSummary ? "Context ready" : "Summarizing portfolio..."}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-800 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModel("chatgpt")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  model === "chatgpt"
                    ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-sm"
                    : "bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                ChatGPT
              </button>
              <button
                type="button"
                onClick={() => setModel("gemini")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  model === "gemini"
                    ? "bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-sm"
                    : "bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                Gemini
              </button>
            </div>
          </div>

          <div className="h-[340px] overflow-y-auto px-4 py-3 space-y-3">
            {summaryLoading && (
              <div className="text-sm text-slate-500 dark:text-zinc-400">Generating portfolio summary...</div>
            )}

            {errorMsg && <div className="text-sm text-red-500 dark:text-red-400">{errorMsg}</div>}

            {!summaryLoading && renderMessages.length === 0 && (
              <div className="text-sm text-slate-500 dark:text-zinc-400">
                Open chat to generate portfolio context.
              </div>
            )}

            {renderMessages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap px-3 py-2 rounded-xl text-sm border ${
                    m.role === "user"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your portfolio..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 text-sm outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={!canSend}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  canSend
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 cursor-not-allowed"
                }`}
              >
                {chatLoading ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

