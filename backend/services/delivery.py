from backend.db.supabase import get_supabase
from backend.schemas.models import DeliveryTask


def create_delivery_task(order_id: str, address: str) -> DeliveryTask:
    supabase = get_supabase()
    task_data = {
        "order_id": order_id,
        "address": address,
        "status": "pending",
    }
    response = supabase.table("deliveries").insert(task_data).execute()
    return DeliveryTask(**response.data[0])
