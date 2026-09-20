from pydantic import BaseModel
from typing import Optional


class AgentState(BaseModel):
    raw_input: str
    channel: str
    normalized_text: Optional[str] = None
    intent: Optional[str] = None
    products: list[dict] | None = None
    quantities: list[int] | None = None
    customer_id: Optional[str] = None
    order_total: Optional[float] = None
    inventory_available: Optional[bool] = None
    delivery_required: Optional[bool] = None
    delivery_address: Optional[str] = None
    order_id: Optional[str] = None
    delivery_task_id: Optional[str] = None
    confirmation_message: Optional[str] = None
    error: Optional[str] = None
    success: bool | None = None
    items: list[dict] | None = None
    delivery_created: bool | None = None
