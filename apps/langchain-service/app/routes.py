from __future__ import annotations

from fastapi import APIRouter
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from .chat_agent import run_chat_with_tools
from .llm_factory import get_llm
from .prompts import (
    build_chat_system_prompt,
    build_summarize_system_prompt,
    build_summarize_user_prompt,
)
from .schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    SummarizeRequest,
    SummarizeResponse,
)

router = APIRouter()


def build_history(history: list[ChatMessage]) -> list:
    messages = []
    for item in history:
        if item.role == "user":
            messages.append(HumanMessage(content=item.content))
        else:
            messages.append(AIMessage(content=item.content))
    return messages


@router.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest) -> SummarizeResponse:
    model = req.model or "chatgpt"
    llm = get_llm(model)

    system_prompt = build_summarize_system_prompt()
    user_prompt = build_summarize_user_prompt(req.snapshot)

    response = llm.invoke(
        [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]
    )
    return SummarizeResponse(summary=response.content)


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    llm = get_llm(req.model)
    system_prompt = build_chat_system_prompt(
        req.portfolio_context_markdown,
        req.portfolio_summary,
    )

    history_messages = build_history(req.history)
    reply = run_chat_with_tools(
        llm,
        system_prompt,
        history_messages,
        req.message,
    )
    return ChatResponse(reply=reply)

