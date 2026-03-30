from fastapi import FastAPI
from app.routes import router


app = FastAPI(title="Tradeee LLM Service")
app.include_router(router)

