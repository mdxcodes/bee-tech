from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Customer(BaseModel):
    id: str
    name: str
    phone: str
    address: Optional[str] = None


class Product(BaseModel):
    id: str
    name: str
    price: float
    stock: int


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total: float


class Order(BaseModel):
    id: str
    customer_id: Optional[str]
    items: list[OrderItem]
    total: float
    status: str
    created_at: Optional[datetime] = None


class DeliveryTask(BaseModel):
    id: str
    order_id: str
    address: str
    status: str
    created_at: Optional[datetime] = None
