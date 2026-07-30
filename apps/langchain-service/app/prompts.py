from __future__ import annotations

from datetime import datetime


def build_summarize_system_prompt(*, periodic_update: bool = False) -> str:
    now = datetime.utcnow().strftime("%Y-%m-%d")
    base = (
        "You are a portfolio assistant for AssetLens. "
        "Given a portfolio snapshot, produce a clear, accurate summary for the user.\n\n"
        "Respond in GitHub-Flavored Markdown only. Use this structure:\n"
        "## Overview\n"
        "2–4 sentences: total exposure, main venues (Binance vs Zerodha), and anything notable.\n\n"
        "## Holdings\n"
        "Bullet or compact table highlights of the largest positions (stocks, crypto, mutual funds).\n\n"
        "## Allocation\n"
        "Short comment on concentration vs diversification (no precise percentages required unless obvious from data).\n\n"
        "## Notes\n"
        "Risks, data gaps (e.g. auth errors in snapshot), or follow-ups the user might want to verify.\n\n"
    )

    if periodic_update:
        base += (
            "## Since last update (≈2h ago)\n"
            "When delta data is provided, call out largest gainers/losers by INR value or %, "
            "new or removed positions, and overall portfolio value change. "
            "If Zerodha auth failed in the snapshot, tell the user to re-login at /trade/redirect.\n\n"
        )

    base += (
        f"Today's date: {now}.\n"
        "Do not claim you executed trades. Be concise but informative."
    )
    return base


def build_summarize_user_prompt(
    snapshot: object,
    delta: object | None = None,
) -> str:
    prompt = (
        "Portfolio snapshot (JSON):\n"
        f"{snapshot}\n\n"
    )
    if delta is not None:
        prompt += (
            "Portfolio delta since last update (JSON):\n"
            f"{delta}\n\n"
        )
    prompt += "Summarize holdings and provide key insights using the Markdown structure from your instructions."
    return prompt


def build_chat_system_prompt(
    portfolio_context_markdown: str | None,
    portfolio_summary: str | None = None,
) -> str:
    now = datetime.utcnow().strftime("%Y-%m-%d")
    prompt = (
        "You are a helpful portfolio assistant for AssetLens.\n"
        f"Today's date: {now}.\n\n"
        "Always format your replies in GitHub-Flavored Markdown for readability:\n"
        "- Use ## or ### headings to structure answers.\n"
        "- Use bullet lists for steps or multiple points; use **bold** for key numbers and labels.\n"
        "- Use Markdown tables when comparing holdings or scenarios.\n"
        "- Use fenced code blocks only for short formulas or ticker lists, not for entire answers.\n\n"
        "When portfolio context is provided below, treat it as the authoritative view of the user's "
        "dashboard (holdings, quantities, INR values, Binance funding vs spot, SIPs). "
        "If a section is missing or shows an error, say so and avoid inventing numbers.\n"
        "When appropriate, suggest high-level next actions. You are authorized to execute asset conversion trades using your tools.\n\n"
        "You are also authorized to place Zerodha equity market orders through the dedicated place-order tool when the user explicitly asks to execute.\n"
        "CRITICAL RULE: Before executing ANY trade on Zerodha or Binance, you MUST fetch the latest news for the target asset using the `get_asset_news` tool. Analyze the sentiment of the news. Only proceed with the trade if the news aligns with the user's trading strategy or shows positive/neutral sentiment, and briefly justify your decision based on the news to the user.\n\n"
        "You have separate tools for each AssetLens backend GET route (health, Zerodha profile/holdings/SIPs, "
        "Binance funding/spot, portfolio summary/assets/INR crypto). "
        "Call the tools that match the user's question to fetch live JSON when needed or when the snapshot "
        "is insufficient. Prefer the portfolio context block for a quick overview; use tools for drill-down "
        "or fresher raw data. Parse JSON tool results and explain them in Markdown for the user.\n\n"
    )

    if portfolio_context_markdown and portfolio_context_markdown.strip():
        prompt += "Portfolio context (Markdown, from live dashboard snapshot):\n"
        prompt += portfolio_context_markdown.strip()
        prompt += "\n\n"
    elif portfolio_summary and portfolio_summary.strip():
        prompt += "Portfolio summary (legacy text):\n"
        prompt += portfolio_summary.strip()
        prompt += "\n\n"

    return prompt
