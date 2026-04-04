"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { api, routes } from "../lib/api";

type Model = "chatgpt" | "gemini";
type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [model, setModel] = useState<Model>("chatgpt");

  const [renderMessages, setRenderMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const [chatLoading, setChatLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [input, setInput] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !chatLoading, [input, chatLoading]);

  // Handle Entrance / FullScreen GSAP Animations
  useGSAP(() => {
    if (open && panelRef.current) {
      if (!isFullScreen) {
        // Initial entrance
        gsap.fromTo(
          panelRef.current,
          { y: 50, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
        );
      }
    }
  }, [open]);

  // Fullscreen transition
  useGSAP(() => {
    if (open && panelRef.current) {
      if (isFullScreen) {
        gsap.to(panelRef.current, {
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          bottom: 0,
          right: 0,
          borderRadius: 0,
          duration: 0.5,
          ease: "power3.inOut",
        });
      } else {
        gsap.to(panelRef.current, {
          width: "380px",
          height: "600px",
          maxWidth: "calc(100vw - 48px)",
          bottom: 24,
          right: 24,
          borderRadius: "1.5rem",
          duration: 0.5,
          ease: "power3.inOut",
        });
      }
    }
  }, [isFullScreen, open]);

  const handleClose = () => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setOpen(false);
          setIsFullScreen(false);
        },
      });
    } else {
      setOpen(false);
    }
  };

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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          {/* Glass Overlay for Full Screen Mode */}
          {isFullScreen && (
            <div className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-md transition-opacity duration-500" />
          )}
          
          <div
            ref={panelRef}
            className="fixed z-50 flex flex-col border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden"
            role="dialog"
            aria-label="Portfolio chat"
            // Start transparent so GSAP can take over smoothly
            style={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-zinc-800 shrink-0">
              <div className="flex flex-col">
                <div className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  Tradeee AI
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Ask a question — portfolio context refreshes each message
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="w-8 h-8 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-colors"
                  aria-label="Toggle full screen"
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sub-Header Selection */}
            <div className="px-5 py-2.5 border-b border-slate-200 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModel("chatgpt")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    model === "chatgpt"
                      ? "bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-zinc-600"
                      : "bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  ChatGPT
                </button>
                <button
                  type="button"
                  onClick={() => setModel("gemini")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    model === "gemini"
                      ? "bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-zinc-600"
                      : "bg-transparent text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  Gemini
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className={`flex-1 overflow-y-auto px-5 py-4 space-y-5 ${isFullScreen ? "text-base" : "text-sm"}`}>
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              {renderMessages.length === 0 && !errorMsg && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                  <svg className="w-12 h-12 text-slate-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-slate-500 dark:text-zinc-400 max-w-[200px] leading-relaxed">
                    Ask Tradeee AI about your portfolio insights or next moves.
                  </p>
                </div>
              )}

              {renderMessages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      m.role === "user"
                        ? "bg-teal-600 text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-bl-sm border border-slate-200/50 dark:border-zinc-700/50"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-700 max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-200/50 dark:border-zinc-700/50">
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input Footer */}
            <div className="px-5 py-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <form
                className="flex items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage();
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Ask about your portfolio... (Shift+Enter for new line)"
                  className="flex-1 max-h-32 min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-y"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className={`h-[44px] px-5 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 flex items-center justify-center ${
                    canSend
                      ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95"
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Send
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
