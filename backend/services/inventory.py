from typing import Optional

from backend.db.supabase import get_supabase
from backend.schemas.models import Product


def search_inventory(query: str) -> list[Product]:
    supabase = get_supabase()
    response = supabase.table("products").select("*").ilike("name", f"%{query}%").execute()
    return [Product(**item) for item in response.data]


def get_product(product_id: str) -> Product | None:
    supabase = get_supabase()
    response = supabase.table("products").select("*").eq("id", product_id).single().execute()
    if response.data:
        return Product(**response.data)
    return None


def check_availability(product_id: str, quantity: int) -> bool:
    supabase = get_supabase()
    response = supabase.table("products").select("stock").eq("id", product_id).single().execute()
    if response.data:
        return response.data["stock"] >= quantity
    return False
