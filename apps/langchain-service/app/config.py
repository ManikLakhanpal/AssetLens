from __future__ import annotations

import os


def get_openai_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def get_gemini_model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-1.5-flash")


def get_openai_temperature() -> float:
    return float(os.getenv("OPENAI_TEMPERATURE", "0.2"))


def get_gemini_temperature() -> float:
    return float(os.getenv("GEMINI_TEMPERATURE", "0.2"))


def get_assetlens_api_base_url() -> str:
    """Base URL for the Node AssetLens API (GET routes for tools)."""
    raw = os.getenv("ASSETLENS_API_BASE_URL", "http://localhost:4000").strip()
    return raw.rstrip("/")


def ensure_google_api_key() -> None:
    # Gemini LangChain adapter uses GOOGLE_API_KEY by default.
    if os.getenv("GOOGLE_API_KEY") is None and os.getenv("GEMINI_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]
