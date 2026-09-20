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
    success: bool | None = None
    message: str | None = None
    order_id: str | None = None
    items: list[dict] | None = None
    total: float | None = None
    delivery_created: bool | None = None
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
        success=result.success,
        message=result.confirmation_message,
        order_id=result.order_id,
        items=result.items,
        total=result.total,
        delivery_created=result.delivery_created,
        error=result.error,
    )


@router.get("/health")
async def health():
    return {"status": "ok"}
