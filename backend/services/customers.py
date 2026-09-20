from typing import Optional

from backend.db.supabase import get_supabase
from backend.schemas.models import Customer


def get_customer_by_phone(phone: str) -> Customer | None:
    supabase = get_supabase()
    response = supabase.table("customers").select("*").eq("phone", phone).execute()
    if response.data:
        return Customer(**response.data[0])
    return None


def get_previous_orders(customer_id: str) -> list[dict]:
    supabase = get_supabase()
    response = (
        supabase.table("orders")
        .select("*")
        .eq("customer_id", customer_id)
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )
    return response.data
