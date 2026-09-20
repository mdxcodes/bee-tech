from typing import List
from pydantic import BaseModel, Field

from .mock_db import (
    get_inventory,
    get_product_price,
    create_order,
    update_inventory
)


class OrderItem(BaseModel):
    product_name: str = Field(
        description="Name of the product the customer wants."
    )

    quantity: int = Field(
        description="Number of units requested by the customer.",
        gt=0
    )


class OrderRequest(BaseModel):
    items: List[OrderItem]


def check_inventory(product_name: str) -> dict:
    """
    Checks the live store inventory for a product.

    Args:
        product_name: Name of the product to check.

    Returns:
        Current stock, unit and price information.
    """

    return get_inventory(product_name)


def check_price(product_name: str) -> dict:
    """
    Gets the current price of a product from the store database.

    Args:
        product_name: Name of the product.

    Returns:
        Current price and unit information.
    """

    return get_product_price(product_name)


def place_order(items: List[OrderItem]) -> dict:
    """
    Creates a customer order after checking product availability.

    Args:
        items: List of requested products and quantities.

    Returns:
        Created order information.
    """

    return create_order(items)


def reduce_inventory(items: List[OrderItem]) -> dict:
    """
    Reduces inventory after an order has been successfully created.

    Args:
        items: Products and quantities ordered.

    Returns:
        Updated inventory information.
    """

    return update_inventory(items)