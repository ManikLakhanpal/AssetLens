from __future__ import annotations

import json
from typing import List

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage

from .route_tools import TOOL_NAME_TO_PATH, tradeee_route_tools
from .api_fetch import fetch_tradeee_get


def _extract_text(ai: AIMessage) -> str:
    text = ai.content
    if isinstance(text, str):
        return text
    if isinstance(text, list):
        parts: List[str] = []
        for block in text:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(str(block.get("text", "")))
            elif isinstance(block, str):
                parts.append(block)
        return "".join(parts) if parts else ""
    return str(text) if text is not None else ""


def _tool_messages_for_ai_message(ai: AIMessage) -> List[ToolMessage]:
    out: List[ToolMessage] = []
    calls = getattr(ai, "tool_calls", None) or []
    for tc in calls:
        tid = tc.get("id") or ""
        name = tc.get("name") or ""
        path = TOOL_NAME_TO_PATH.get(name)
        if path is not None:
            payload = fetch_tradeee_get(path)
        else:
            payload = json.dumps({"error": "unknown_tool", "name": name})
        out.append(ToolMessage(content=payload, tool_call_id=tid))
    return out


def run_chat_with_tools(
    llm: BaseChatModel,
    system_prompt: str,
    history: List[BaseMessage],
    user_message: str,
    *,
    max_tool_rounds: int = 14,
) -> str:
    llm_bound = llm.bind_tools(tradeee_route_tools)

    messages: List[BaseMessage] = [SystemMessage(content=system_prompt)]
    messages.extend(history)
    messages.append(HumanMessage(content=user_message))

    for _ in range(max_tool_rounds):
        ai = llm_bound.invoke(messages)

        if not isinstance(ai, AIMessage):
            return str(getattr(ai, "content", ai))

        tool_calls = getattr(ai, "tool_calls", None) or []
        if not tool_calls:
            return _extract_text(ai)

        messages.append(ai)
        for tm in _tool_messages_for_ai_message(ai):
            messages.append(tm)

    return (
        "I stopped after too many tool calls. "
        "Please narrow your question or try again."
    )
