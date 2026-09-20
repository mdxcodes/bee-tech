from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .agent import run_agent


app = FastAPI(
    title="Zero-Click Store Operator",
    description="Autonomous AI operator for a neighborhood kirana store",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Zero-Click Store Operator"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    response = run_agent(request.message)

    return {
        "success": True,
        "response": response
    }


@app.post("/image")
async def process_image(file: UploadFile = File(...)):

    # Image processing will be added after the basic
    # text workflow is confirmed working.

    return {
        "success": False,
        "message": "Image processing endpoint is ready but vision processing will be enabled next."
    }


# Serve frontend
frontend_path = Path(__file__).parent.parent / "frontend"

if frontend_path.exists():
    app.mount(
        "/",
        StaticFiles(directory=frontend_path, html=True),
        name="frontend"
    )