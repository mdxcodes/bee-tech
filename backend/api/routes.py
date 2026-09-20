from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agent.state import AgentState
from agent.graph import StoreAgent

router = APIRouter()


class NormalizedRequest(BaseModel):
    channel: str
    text: str
    customer_identifier: str | None = None


class OrderResponse(BaseModel):
    order_id: str | None = None
    confirmation: str | None = None
    error: str | None = None


@router.post("/process", response_model=OrderResponse)
async def process_request(request: NormalizedRequest):
    state = AgentState(
        raw_input=request.text,
        channel=request.channel,
    )
    agent = StoreAgent()
    result = await agent.run(state)
    return OrderResponse(
        order_id=result.order_id,
        confirmation=result.confirmation_message,
        error=result.error,
    )


@router.get("/health")
async def health():
    return {"status": "ok"}
