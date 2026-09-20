from fastapi import FastAPI
from backend.api.routes import router
from backend.api.routes_whatsapp import router as whatsapp_router

app = FastAPI(
    title="Zero-Click Store Operator",
    description="Backend for the multimodal autonomous AI store operator.",
    version="0.1.0",
)

app.include_router(router, prefix="/api/v1")
app.include_router(whatsapp_router, prefix="/api/v1")
