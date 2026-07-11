from ddgs import DDGS
try:
    with DDGS() as ddgs:
        results = list(ddgs.news("Nippon India Large Cap Fund", max_results=5))
        print("Success:", results)
except Exception as e:
    print("Error:", str(e))
