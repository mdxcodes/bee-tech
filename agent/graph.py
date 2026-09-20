import os
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types

from agent.state import AgentState
from agent.tools import TOOLS

load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

SYSTEM_PROMPT = """You are an autonomous AI operator for a neighborhood Indian Kirana store.

Your job is to understand customer requests and actually execute store operations using the available tools.

You are NOT merely a chatbot.

Use tools to retrieve authoritative store information and perform actions.

Never invent product names, prices, stock quantities, order IDs, or delivery status.

The database is authoritative.

When the customer requests an order:
1. Identify the requested products and quantities.
2. Search live inventory.
3. Resolve product matches.
4. If products are available and unambiguous, create the order.
5. If delivery is requested, create a delivery task.
6. Verify the tool results.
7. Return a concise customer confirmation.

If information is ambiguous, ask the customer instead of guessing.

Never claim an action succeeded unless the corresponding tool returned success."""


def _get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY must be set in environment")
    return genai.Client(api_key=api_key)


def _build_tool_definitions() -> list[types.Tool]:
    declarations = [
        types.FunctionDeclaration(
            name="search_inventory",
            description="Search inventory for products by name or keyword.",
            parameters={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query, e.g. 'Amul Taaza' or 'Maggi'.",
                    }
                },
                "required": ["query"],
            },
        ),
        types.FunctionDeclaration(
            name="get_product_price",
            description="Get the current price of a product by its ID.",
            parameters={
                "type": "object",
                "properties": {
                    "product_id": {
                        "type": "string",
                        "description": "The product ID.",
                    }
                },
                "required": ["product_id"],
            },
        ),
        types.FunctionDeclaration(
            name="check_availability",
            description="Check if a product is available in the requested quantity.",
            parameters={
                "type": "object",
                "properties": {
                    "product_id": {
                        "type": "string",
                        "description": "The product ID.",
                    },
                    "quantity": {
                        "type": "integer",
                        "description": "Requested quantity.",
                    },
                },
                "required": ["product_id", "quantity"],
            },
        ),
        types.FunctionDeclaration(
            name="create_order",
            description="Create a structured order. The backend calculates total from database prices. Requires items with product_id and quantity.",
            parameters={
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "string",
                        "description": "Optional customer ID.",
                    },
                    "items": {
                        "type": "array",
                        "description": "List of items, each with product_id and quantity.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "product_id": {"type": "string"},
                                "quantity": {"type": "integer"},
                            },
                            "required": ["product_id", "quantity"],
                        },
                    },
                },
                "required": ["items"],
            },
        ),
        types.FunctionDeclaration(
            name="get_customer_by_phone",
            description="Look up a customer by phone number.",
            parameters={
                "type": "object",
                "properties": {
                    "phone": {
                        "type": "string",
                        "description": "Customer phone number.",
                    }
                },
                "required": ["phone"],
            },
        ),
        types.FunctionDeclaration(
            name="get_previous_orders",
            description="Get recent orders for a customer.",
            parameters={
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "string",
                        "description": "Customer ID.",
                    }
                },
                "required": ["customer_id"],
            },
        ),
        types.FunctionDeclaration(
            name="create_delivery_task",
            description="Create a delivery task for an order.",
            parameters={
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order ID.",
                    },
                    "address": {
                        "type": "string",
                        "description": "Delivery address.",
                    },
                },
                "required": ["order_id", "address"],
            },
        ),
    ]
    return [types.Tool(function_declarations=declarations)]


def _execute_tool_call(name: str, args: dict[str, Any]) -> Any:
    func = TOOLS.get(name)
    if not func:
        return {"error": f"Unknown tool: {name}"}
    try:
        return func(**args)
    except Exception as exc:
        return {"error": str(exc)}


class StoreAgent:
    def __init__(self) -> None:
        self.tools = TOOLS

    async def run(self, state: AgentState) -> AgentState:
        client = _get_client()
        tools_def = _build_tool_definitions()
        config = types.GenerateContentConfig(
            tools=tools_def,
            system_instruction=SYSTEM_PROMPT,
        )

        contents: list[types.Content] = [
            types.Content(
                role="user",
                parts=[types.Part(text=state.raw_input)],
            )
        ]

        tool_results: dict[str, Any] = {}
        max_iterations = 10

        for _ in range(max_iterations):
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents,
                config=config,
            )

            if not response.candidates:
                state.error = "No response from model."
                state.success = False
                return state

            candidate = response.candidates[0]
            if not candidate.content or not candidate.content.parts:
                state.error = "Empty response from model."
                state.success = False
                return state

            parts = candidate.content.parts

            function_calls = [p for p in parts if p.function_call]
            text_parts = [p for p in parts if p.text]

            if text_parts and not function_calls:
                state.confirmation_message = text_parts[0].text.strip()
                state.success = True

                if "create_order" in tool_results:
                    order = tool_results["create_order"]
                    state.order_id = order.get("id")
                    state.items = order.get("items")
                    state.total = order.get("total")

                if "create_delivery_task" in tool_results:
                    delivery = tool_results["create_delivery_task"]
                    state.delivery_task_id = delivery.get("id")
                    state.delivery_created = True

                return state

            if function_calls:
                contents.append(types.Content(role="model", parts=parts))

                response_parts = []
                for fc in function_calls:
                    result = _execute_tool_call(fc.name, dict(fc.args))
                    tool_results[fc.name] = result
                    response_parts.append(
                        types.Part(
                            function_response=types.FunctionResponse(
                                name=fc.name,
                                response=result if isinstance(result, dict) else {"result": result},
                            )
                        )
                    )

                contents.append(types.Content(role="user", parts=response_parts))

        state.error = "Agent stopped: maximum tool-call iterations reached."
        state.success = False
        return state


agent = StoreAgent()
