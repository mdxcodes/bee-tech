from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Customer(BaseModel):
    id: str | int
    name: str
    phone: str
    address: Optional[str] = None


class Product(BaseModel):
    id: str | int
    name: str
    price: float
    stock_quantity: int


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total: float


class Order(BaseModel):
    id: str | int
    customer_id: str | int | None
    total_amount: float
    status: str
    delivery_address: str | None = None
    items: list[dict] | None = None
    created_at: Optional[datetime] = None


class DeliveryTask(BaseModel):
    id: str | int
    order_id: str | int
    address: str
    status: str
    created_at: Optional[datetime] = None
