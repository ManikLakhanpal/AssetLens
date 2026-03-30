from __future__ import annotations

from datetime import datetime


def build_summarize_system_prompt() -> str:
    now = datetime.utcnow().strftime("%Y-%m-%d")
    return (
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


def build_summarize_user_prompt(snapshot: object) -> str:
    return (
        "Portfolio snapshot (JSON):\n"
        f"{snapshot}\n\n"
        "Summarize holdings and provide key insights."
    )


def build_chat_system_prompt(portfolio_summary: str | None) -> str:
    now = datetime.utcnow().strftime("%Y-%m-%d")
    prompt = (
        "You are a helpful portfolio assistant for Tradeee.\n"
        f"Today's date: {now}.\n\n"
        "If a portfolio_summary is provided, use it as context.\n"
        "When appropriate, make suggestions for next actions (high-level only). "
        "Do not claim you executed trades.\n\n"
    )

    if portfolio_summary:
        prompt += f"Portfolio summary:\n{portfolio_summary}\n\n"

    return prompt

