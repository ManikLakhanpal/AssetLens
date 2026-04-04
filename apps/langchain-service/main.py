from fastapi import FastAPI
from app.routes import router


app = FastAPI(title="AssetLens LLM Service")
app.include_router(router)

