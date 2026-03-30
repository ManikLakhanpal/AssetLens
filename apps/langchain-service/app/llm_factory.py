from __future__ import annotations

from typing import Literal

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from .config import (
    ensure_google_api_key,
    get_gemini_model,
    get_gemini_temperature,
    get_openai_model,
    get_openai_temperature,
)


def get_llm(model: Literal["chatgpt", "gemini"]):
    if model == "chatgpt":
        return ChatOpenAI(
            model=get_openai_model(),
            temperature=get_openai_temperature(),
        )

    ensure_google_api_key()
    return ChatGoogleGenerativeAI(
        model=get_gemini_model(),
        temperature=get_gemini_temperature(),
    )

