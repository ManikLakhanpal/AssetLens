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
    portfolio_summary: Optional[str] = None


class SummarizeResponse(BaseModel):
    summary: str


class ChatResponse(BaseModel):
    reply: str

