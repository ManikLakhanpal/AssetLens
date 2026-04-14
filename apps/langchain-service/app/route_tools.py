from __future__ import annotations

from langchain_core.tools import StructuredTool, tool

from .api_fetch import fetch_assetlens_get, fetch_assetlens_post

# (tool_name, path, description) — one LangChain tool per Node GET route.
_ROUTE_SPECS: tuple[tuple[str, str, str], ...] = (
    (
        "get_api_health",
        "/health",
        "Check whether the AssetLens Node API is up. Returns JSON like {\"message\":\"OK\"}.",
    ),
    (
        "get_zerodha_profile",
        "/zerodha/profile",
        "Zerodha (Kite) user profile: user_id, name, email, broker, exchanges, etc. May return an auth error JSON if not logged in.",
    ),
    (
        "get_zerodha_stock_holdings",
        "/zerodha/stock-holdings-data",
        "Equity holdings: symbols, quantities, average price, LTP, P&L, day change.",
    ),
    (
        "get_zerodha_mf_holdings",
        "/zerodha/mf-holdings-data",
        "Mutual fund holdings: fund name, folio, qty, prices, P&L, XIRR.",
    ),
    (
        "get_zerodha_mf_sips",
        "/zerodha/mf-sips",
        "Mutual fund SIPs: status, amounts, frequency, next instalment, pending counts.",
    ),
    (
        "get_binance_funding_wallet",
        "/binance/funding-account-data",
        "Raw Binance funding wallet balances (asset, free, locked).",
    ),
    (
        "get_binance_spot_account",
        "/binance/spot-account-data",
        "Raw Binance spot account balances (asset, free, locked).",
    ),
    (
        "get_portfolio_binance_inr",
        "/portfolio/binance/inr-value",
        "Binance positions valued in INR: combined, funding, and spot splits with quantities and INR values.",
    ),
    (
        "get_portfolio_summary",
        "/portfolio/summary",
        "Aggregate INR totals: binance_inr, zerodha_inr (stocks only), total_inr.",
    ),
    (
        "get_portfolio_assets",
        "/portfolio/assets",
        "Per-symbol INR slices for stocks and crypto (above ₹10), sorted by value.",
    ),
    (
        "get_binance_permissions",
        "/binance/permissions",
        "Fetch the active capabilities (Can Trade, Can Withdraw, etc.) attached to the API key.",
    ),
)

TOOL_NAME_TO_PATH: dict[str, str] = {name: path for name, path, _ in _ROUTE_SPECS}


def _make_route_tool(name: str, path: str, description: str) -> StructuredTool:
    def tool_fn() -> str:
        return fetch_assetlens_get(path)

    tool_fn.__name__ = name
    return StructuredTool.from_function(
        func=tool_fn,
        name=name,
        description=description,
    )


assetlens_route_tools: list[StructuredTool] = [
    _make_route_tool(name, path, desc) for name, path, desc in _ROUTE_SPECS
]


@tool
def post_binance_convert(symbol: str, side: str, amount: float) -> str:
    """
    Execute a market spot trade to convert assets on Binance.
    - symbol: e.g. "BTCUSDT"
    - side: "BUY" or "SELL"
    - amount: How much of the quote asset to spend (for BUY) or how much to sell (for SELL).
    """
    return fetch_assetlens_post(
        "/binance/convert",
        {"symbol": symbol, "side": side.upper(), "amount": amount},
    )


assetlens_route_tools.append(post_binance_convert)


@tool
def post_binance_transfer(type: str, asset: str, amount: float) -> str:
    """
    Execute a universal transfer between spot and funding wallets on Binance.
    - type: "MAIN_FUNDING" (Spot to Funding) or "FUNDING_MAIN" (Funding to Spot)
    - asset: e.g. "USDT"
    - amount: How much of the asset to transfer.
    """
    return fetch_assetlens_post(
        "/binance/transfer",
        {"type": type.upper(), "asset": asset.upper(), "amount": amount},
    )


assetlens_route_tools.append(post_binance_transfer)


@tool
def post_zerodha_place_order(
    variety: str,
    tradingsymbol: str,
    exchange: str,
    qty: float,
    orderType: str,
) -> str:
    """
    Place a live market order on Zerodha.
    - variety: "amo", "regular", "co", "auction", or "iceberg"
    - tradingsymbol: e.g. "RELIANCE"
    - exchange: "NSE" or "BSE"
    - qty: positive quantity
    - orderType: "BUY" or "SELL"
    """
    return fetch_assetlens_post(
        "/zerodha/place-order",
        {
            "variety": variety.lower(),
            "tradingsymbol": tradingsymbol.strip().upper(),
            "exchange": exchange.upper(),
            "qty": qty,
            "orderType": orderType.upper(),
        },
    )


assetlens_route_tools.append(post_zerodha_place_order)
