from __future__ import annotations

import json
from langchain_core.tools import tool
from ddgs import DDGS

@tool
def get_asset_news(asset_name: str) -> str:
    """
    Fetch the latest news headlines and snippets for a given asset (e.g. "RELIANCE", "Bitcoin", "TCS").
    Use this to analyze sentiment or current events before making trading decisions.
    - asset_name: The name or ticker of the asset to search news for.
    """
    try:
        results = []
        with DDGS() as ddgs:
            # Query for latest news related to the asset
            news_generator = ddgs.news(
                asset_name, 
                region="wt-wt", 
                safesearch="moderate", 
                max_results=5
            )
            for r in news_generator:
                results.append({
                    "title": r.get("title", ""),
                    "snippet": r.get("body", ""),
                    "source": r.get("source", ""),
                    "date": r.get("date", "")
                })
        
        if not results:
            return json.dumps({"status": "no_news_found", "message": f"No recent news found for {asset_name}."})
            
        return json.dumps({"status": "success", "news": results})
    except Exception as e:
        return json.dumps({"status": "error", "message": f"Failed to fetch news: {str(e)}"})
