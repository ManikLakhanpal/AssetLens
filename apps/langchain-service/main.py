from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI


app = FastAPI(title="Tradeee LLM Service")


class SummarizeRequest(BaseModel):
    snapshot: Dict[str, Any] = Field(..., description="Portfolio snapshot collected by Node")
    # Optional override; if absent, the service chooses based on endpoint defaults.
    model: Optional[Literal["chatgpt", "gemini"]] = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    model: Literal["chatgpt", "gemini"]
    history: List[ChatMessage] = []
    portfolio_summary: Optional[str] = None


class SummarizeResponse(BaseModel):
    summary: str


class ChatResponse(BaseModel):
    reply: str


def get_llm(model: Literal["chatgpt", "gemini"]):
    # NOTE: LangChain uses OPENAI_API_KEY / GEMINI (Google) API key env vars.
    if model == "chatgpt":
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.2")),
        )

    # Gemini integration uses GOOGLE_API_KEY by default.
    if os.getenv("GOOGLE_API_KEY") is None and os.getenv("GEMINI_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

    return ChatGoogleGenerativeAI(
        model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        temperature=float(os.getenv("GEMINI_TEMPERATURE", "0.2")),
    )


def build_history(history: List[ChatMessage]) -> List:
    msgs = []
    for m in history:
        if m.role == "user":
            msgs.append(HumanMessage(content=m.content))
        else:
            msgs.append(AIMessage(content=m.content))
    return msgs


@app.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest) -> SummarizeResponse:
    model: Literal["chatgpt", "gemini"] = req.model or "chatgpt"
    llm = get_llm(model)

    now = datetime.utcnow().strftime("%Y-%m-%d")
    system_prompt = (
        "You are a portfolio assistant for Tradeee. "
        "Given a portfolio snapshot, produce a useful summary for the user.\n\n"
        "Return format:\n"
        "Paragraph: <short paragraph>\n"
        "Bullets:\n"
        "- <bullet 1>\n"
        "- <bullet 2>\n"
        "- <bullet 3>\n\n"
        f"Today's date: {now}. "
        "Keep it concise and accurate."
    )

    # Keep input size under control by passing snapshot as-is; FastAPI/LLM will truncate if needed.
    user_prompt = (
        "Portfolio snapshot (JSON):\n"
        f"{req.snapshot}\n\n"
        "Summarize holdings and provide key insights."
    )

    resp = llm.invoke([SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)])
    return SummarizeResponse(summary=resp.content)


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    llm = get_llm(req.model)

    now = datetime.utcnow().strftime("%Y-%m-%d")
    system_prompt = (
        "You are a helpful portfolio assistant for Tradeee.\n"
        f"Today's date: {now}.\n\n"
        "If a portfolio_summary is provided, use it as context.\n"
        "When appropriate, make suggestions for next actions (high-level only). "
        "Do not claim you executed trades.\n\n"
    )

    if req.portfolio_summary:
        system_prompt += f"Portfolio summary:\n{req.portfolio_summary}\n\n"

    messages = [SystemMessage(content=system_prompt)]
    messages.extend(build_history(req.history))
    messages.append(HumanMessage(content=req.message))

    resp = llm.invoke(messages)
    return ChatResponse(reply=resp.content)

