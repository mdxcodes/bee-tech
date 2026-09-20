from datetime import datetime
from typing import Optional

from backend.db.supabase import get_supabase
from backend.schemas.models import Order


def create_order(
    customer_id: Optional[str],
    items: list[dict],
    delivery_address: Optional[str] = None,
) -> Order:
    supabase = get_supabase()

    if not customer_id:
        customer_id = 999

    order_data = {
        "customer_id": customer_id,
        "total_amount": 0.0,
        "status": "confirmed",
        "delivery_address": delivery_address,
        "created_at": datetime.utcnow().isoformat(),
    }
    response = supabase.table("orders").insert(order_data).execute()
    order = Order(**response.data[0])
    order_id = order.id

    built_items = []
    total = 0.0

    for item in items:
        product_id = item["product_id"]
        quantity = item["quantity"]

        product_response = (
            supabase.table("products")
            .select("id, name, price")
            .eq("id", product_id)
            .single()
            .execute()
        )

        if not product_response.data:
            raise ValueError(f"Product {product_id} not found")

        product = product_response.data
        unit_price = float(product["price"])
        subtotal = round(unit_price * quantity, 2)
        total += subtotal

        built_items.append(
            {
                "product_id": product_id,
                "product_name": product["name"],
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            }
        )

    total = round(total, 2)

    supabase.table("orders").update({"total_amount": total}).eq("id", order_id).execute()

    for item in built_items:
        supabase.table("order_items").insert(
            {
                "order_id": order_id,
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "unit_price": item["unit_price"],
                "subtotal": item["subtotal"],
            }
        ).execute()

    return Order(**supabase.table("orders").select("*").eq("id", order_id).single().execute().data)


def get_order(order_id: str) -> Order | None:
    supabase = get_supabase()
    response = supabase.table("orders").select("*").eq("id", order_id).single().execute()
    if response.data:
        return Order(**response.data)
    return None
