from datetime import datetime
from typing import Optional

from backend.db.supabase import get_supabase
from backend.schemas.models import Order, OrderItem


def create_order(customer_id: Optional[str], items: list[dict]) -> Order:
    supabase = get_supabase()

    built_items = []
    total = 0.0

    for item in items:
        product_id = item["product_id"]
        quantity = item["quantity"]

        product_response = (
            supabase.table("products")
            .select("id, name, price, stock")
            .eq("id", product_id)
            .single()
            .execute()
        )

        if not product_response.data:
            raise ValueError(f"Product {product_id} not found")

        product = product_response.data
        unit_price = float(product["price"])
        line_total = round(unit_price * quantity, 2)
        total += line_total

        built_items.append(
            {
                "product_id": product_id,
                "product_name": product["name"],
                "quantity": quantity,
                "unit_price": unit_price,
                "total": line_total,
            }
        )

    total = round(total, 2)

    order_data = {
        "customer_id": customer_id,
        "items": built_items,
        "total": total,
        "status": "confirmed",
        "created_at": datetime.utcnow().isoformat(),
    }
    response = supabase.table("orders").insert(order_data).execute()
    return Order(**response.data[0])


def get_order(order_id: str) -> Order | None:
    supabase = get_supabase()
    response = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if response.data:
        return Order(**response.data)
    return None
