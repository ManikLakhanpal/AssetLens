from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class SummarizeRequest(BaseModel):
    snapshot: Dict[str, Any] = Field(..., description="Portfolio snapshot collected by Node")
    model: Optional[Literal["chatgpt", "gemini"]] = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    model: Literal["chatgpt", "gemini"]
    history: List[ChatMessage] = Field(default_factory=list)
    portfolio_context_markdown: Optional[str] = None
    portfolio_summary: Optional[str] = Field(
        default=None,
        description="Deprecated; prefer portfolio_context_markdown from the API server.",
    )
    auth_token: Optional[str] = Field(
        default=None,
        description="JWT forwarded from the Node API so tool calls can authenticate.",
    )


class SummarizeResponse(BaseModel):
    summary: str


class ChatResponse(BaseModel):
    reply: str

