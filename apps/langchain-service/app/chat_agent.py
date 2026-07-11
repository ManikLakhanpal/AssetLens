from __future__ import annotations

import json
from typing import List, Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage

from .api_fetch import set_auth_token
from .route_tools import assetlens_route_tools


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

    tools_by_name = {t.name: t for t in assetlens_route_tools}

    for tc in calls:
        tid = tc.get("id") or ""
        name = tc.get("name") or ""
        args = tc.get("args") or {}

        tool = tools_by_name.get(name)
        if tool is not None:
            try:
                payload = tool.invoke(args)
            except Exception as e:
                payload = json.dumps({"error": "tool_execution_failed", "message": str(e)})
        else:
            payload = json.dumps({"error": "unknown_tool", "name": name})
        
        out.append(ToolMessage(content=str(payload), tool_call_id=tid))
    return out


def run_chat_with_tools(
    llm: BaseChatModel,
    system_prompt: str,
    history: List[BaseMessage],
    user_message: str,
    *,
    auth_token: Optional[str] = None,
    max_tool_rounds: int = 14,
) -> str:
    set_auth_token(auth_token)
    llm_bound = llm.bind_tools(assetlens_route_tools)

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
