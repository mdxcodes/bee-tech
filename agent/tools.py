from typing import Any
from backend.services.inventory import search_inventory, get_product, check_availability
from backend.services.orders import create_order
from backend.services.customers import get_customer_by_phone, get_previous_orders
from backend.services.delivery import create_delivery_task


def search_inventory_tool(query: str) -> list[dict]:
    products = search_inventory(query)
    return [p.model_dump() for p in products]


def get_product_price_tool(product_id: str) -> float | None:
    product = get_product(product_id)
    return product.price if product else None


def check_availability_tool(product_id: str, quantity: int) -> bool:
    return check_availability(product_id, quantity)


def create_order_tool(customer_id: str | None, items: list[dict]) -> dict:
    order = create_order(customer_id, items)
    return order.model_dump()


def get_customer_by_phone_tool(phone: str) -> dict | None:
    customer = get_customer_by_phone(phone)
    return customer.model_dump() if customer else None


def get_previous_orders_tool(customer_id: str) -> list[dict]:
    return get_previous_orders(customer_id)


def create_delivery_task_tool(order_id: str, address: str) -> dict:
    task = create_delivery_task(order_id, address)
    return task.model_dump()


TOOLS = {
    "search_inventory": search_inventory_tool,
    "get_product_price": get_product_price_tool,
    "check_availability": check_availability_tool,
    "create_order": create_order_tool,
    "get_customer_by_phone": get_customer_by_phone_tool,
    "get_previous_orders": get_previous_orders_tool,
    "create_delivery_task": create_delivery_task_tool,
}
