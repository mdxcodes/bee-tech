from copy import deepcopy

# Temporary mock database.
# This will later be replaced by Supabase.

PRODUCTS = {
    "maggi": {
        "id": "P001",
        "name": "Maggi",
        "aliases": ["maggi", "maggi noodles", "noodles"],
        "price": 15,
        "unit": "packet",
        "stock": 20
    },

    "amul milk": {
        "id": "P002",
        "name": "Amul Milk",
        "aliases": ["milk", "amul milk", "amul taaza"],
        "price": 30,
        "unit": "litre",
        "stock": 10
    },

    "aashirvaad atta": {
        "id": "P003",
        "name": "Aashirvaad Atta",
        "aliases": ["atta", "aashirvaad atta", "flour"],
        "price": 55,
        "unit": "kg",
        "stock": 15
    },

    "rice": {
        "id": "P004",
        "name": "Rice",
        "aliases": ["rice", "chawal"],
        "price": 60,
        "unit": "kg",
        "stock": 25
    },

    "fortune oil": {
        "id": "P005",
        "name": "Fortune Oil",
        "aliases": ["oil", "fortune oil", "cooking oil"],
        "price": 130,
        "unit": "litre",
        "stock": 12
    },

    "bread": {
        "id": "P006",
        "name": "Bread",
        "aliases": ["bread", "brad"],
        "price": 40,
        "unit": "packet",
        "stock": 10
    },

    "lays": {
        "id": "P007",
        "name": "Lays",
        "aliases": ["lays", "lays chips", "chips"],
        "price": 20,
        "unit": "packet",
        "stock": 25
    }
}


ORDERS = []

_next_order_number = 1001


def find_product(product_name: str):
    """
    Find a product using its name or alias.
    """

    query = product_name.lower().strip()

    for product in PRODUCTS.values():
        if query == product["name"].lower():
            return deepcopy(product)

        for alias in product["aliases"]:
            if query == alias.lower():
                return deepcopy(product)

    # Partial matching
    for product in PRODUCTS.values():
        if query in product["name"].lower():
            return deepcopy(product)

        for alias in product["aliases"]:
            if query in alias.lower():
                return deepcopy(product)

    return None


def get_inventory(product_name: str):
    product = find_product(product_name)

    if not product:
        return {
            "success": False,
            "message": f"Product '{product_name}' was not found."
        }

    return {
        "success": True,
        "product_id": product["id"],
        "product": product["name"],
        "stock": product["stock"],
        "unit": product["unit"],
        "price": product["price"]
    }


def get_product_price(product_name: str):
    product = find_product(product_name)

    if not product:
        return {
            "success": False,
            "message": f"Product '{product_name}' was not found."
        }

    return {
        "success": True,
        "product": product["name"],
        "price": product["price"],
        "unit": product["unit"]
    }


def create_order(items):
    global _next_order_number

    order_items = []
    total = 0

    for item in items:

        product = find_product(item.product_name)

        if not product:
            return {
                "success": False,
                "message": f"Product '{item.product_name}' was not found."
            }

        quantity = item.quantity

        if quantity <= 0:
            return {
                "success": False,
                "message": f"Invalid quantity for {product['name']}."
            }

        if product["stock"] < quantity:
            return {
                "success": False,
                "message": (
                    f"Only {product['stock']} {product['unit']}(s) "
                    f"of {product['name']} are available."
                )
            }

        item_total = product["price"] * quantity
        total += item_total

        order_items.append({
            "product_id": product["id"],
            "product": product["name"],
            "quantity": quantity,
            "unit": product["unit"],
            "unit_price": product["price"],
            "item_total": item_total
        })

    order_id = f"ORD-{_next_order_number}"
    _next_order_number += 1

    order = {
        "order_id": order_id,
        "items": order_items,
        "total": total,
        "status": "confirmed"
    }

    ORDERS.append(order)

    return {
        "success": True,
        "order": order
    }


def update_inventory(items):
    updated = []

    for item in items:

        product = find_product(item.product_name)

        if not product:
            return {
                "success": False,
                "message": f"Product '{item.product_name}' not found."
            }

        # Update actual dictionary entry
        product_key = None

        for key, stored_product in PRODUCTS.items():
            if stored_product["id"] == product["id"]:
                product_key = key
                break

        if product_key is None:
            continue

        PRODUCTS[product_key]["stock"] -= item.quantity

        updated.append({
            "product": PRODUCTS[product_key]["name"],
            "remaining_stock": PRODUCTS[product_key]["stock"]
        })

    return {
        "success": True,
        "updated_inventory": updated
    }


def get_all_orders():
    return deepcopy(ORDERS)