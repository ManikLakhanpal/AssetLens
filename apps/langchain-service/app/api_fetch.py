from __future__ import annotations

import json
import urllib.error
import urllib.request
from contextvars import ContextVar
from typing import FrozenSet, Optional

from .config import get_assetlens_api_base_url

# Per-request JWT forwarded from the Node API.
# Set by chat_agent before executing tool calls.
_auth_token_var: ContextVar[Optional[str]] = ContextVar("_auth_token_var", default=None)


def set_auth_token(token: Optional[str]) -> None:
    _auth_token_var.set(token)


def _auth_headers() -> dict[str, str]:
    token = _auth_token_var.get()
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}

# Every read-only GET route mounted on the AssetLens Node API (apps/api/src/server.ts).
ALLOWED_GET_PATHS: FrozenSet[str] = frozenset(
    {
        "/health",
        "/zerodha/profile",
        "/zerodha/stock-holdings-data",
        "/zerodha/mf-holdings-data",
        "/zerodha/mf-sips",
        "/binance/funding-account-data",
        "/binance/spot-account-data",
        "/portfolio/binance/inr-value",
        "/portfolio/data",
        "/binance/permissions",
    }
)

ALLOWED_POST_PATHS: FrozenSet[str] = frozenset(
    {
        "/binance/convert",
        "/binance/transfer",
        "/zerodha/place-order",
    }
)


def normalize_route(route: str) -> str:
    r = route.strip()
    if not r.startswith("/"):
        r = "/" + r
    return r.rstrip("/") or "/"


def fetch_assetlens_get(path: str) -> str:
    """Perform an HTTP GET against the AssetLens Node API (allowlisted paths only)."""
    normalized = normalize_route(path)
    if normalized not in ALLOWED_GET_PATHS:
        return json.dumps(
            {
                "error": "route_not_allowed",
                "message": "Path must be one of the allowed GET routes.",
                "allowed_paths": sorted(ALLOWED_GET_PATHS),
            }
        )

    base = get_assetlens_api_base_url().rstrip("/")
    url = f"{base}{normalized}"
    try:
        req = urllib.request.Request(url, method="GET", headers={"Accept": "application/json", **_auth_headers()})
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return body if body.strip() else json.dumps({"ok": True, "empty": True})
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8", errors="replace")
        except Exception:
            err_body = ""
        return json.dumps(
            {
                "error": "http_error",
                "status": e.code,
                "path": normalized,
                "body": err_body[:8000],
            }
        )
    except Exception as e:
        return json.dumps({"error": "request_failed", "path": normalized, "message": str(e)})


def fetch_assetlens_post(path: str, payload: dict) -> str:
    """Perform an HTTP POST against the AssetLens Node API (allowlisted paths only)."""
    normalized = normalize_route(path)
    if normalized not in ALLOWED_POST_PATHS:
        return json.dumps(
            {
                "error": "route_not_allowed",
                "message": "Path must be one of the allowed POST routes.",
                "allowed_paths": sorted(ALLOWED_POST_PATHS),
            }
        )

    base = get_assetlens_api_base_url().rstrip("/")
    url = f"{base}{normalized}"
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url, 
            data=data, 
            method="POST", 
            headers={"Accept": "application/json", "Content-Type": "application/json", **_auth_headers()}
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return body if body.strip() else json.dumps({"ok": True, "empty": True})
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8", errors="replace")
        except Exception:
            err_body = ""
        return json.dumps(
            {
                "error": "http_error",
                "status": e.code,
                "path": normalized,
                "body": err_body[:8000],
            }
        )
    except Exception as e:
        return json.dumps({"error": "request_failed", "path": normalized, "message": str(e)})
