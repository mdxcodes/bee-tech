import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from groq import Groq

from agent.state import AgentState
from agent.tools import TOOLS

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

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
5. If delivery is requested, include the delivery address in the order.
6. Verify the tool results.
7. Return a concise customer confirmation.

Customer ID is optional. If the customer does not provide a phone number or customer ID, create the order without it.

If information is ambiguous, ask the customer instead of guessing.

Never claim an action succeeded unless the corresponding tool returned success."""


def _log_safe_config() -> None:
    api_key_present = bool(GROQ_API_KEY)
    print(
        f"[config] LLM provider: {LLM_PROVIDER} | "
        f"model: {GROQ_MODEL} | "
        f"API key present: {api_key_present}"
    )


def _get_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY must be set in environment")
    return Groq(api_key=api_key)


def _build_tool_definitions() -> list[dict]:
    return [
        {
            "type": "function",
            "function": {
                "name": "search_inventory",
                "description": "Search inventory for products by name or keyword.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query, e.g. 'Amul Taaza' or 'Maggi'.",
                        }
                    },
                    "required": ["query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_product_price",
                "description": "Get the current price of a product by its ID.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "product_id": {
                            "anyOf": [
                                {"type": "string"},
                                {"type": "number"}
                            ],
                            "description": "The product ID.",
                        }
                    },
                    "required": ["product_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "check_availability",
                "description": "Check if a product is available in the requested quantity.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "product_id": {
                            "anyOf": [
                                {"type": "string"},
                                {"type": "number"}
                            ],
                            "description": "The product ID.",
                        },
                        "quantity": {
                            "type": "integer",
                            "description": "Requested quantity.",
                        },
                    },
                    "required": ["product_id", "quantity"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "create_order",
                "description": "Create a structured order. The backend calculates total from database prices. Requires items with product_id and quantity. If the customer requests delivery, include the delivery address.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {
                            "anyOf": [
                                {"type": "string"},
                                {"type": "null"}
                            ],
                            "description": "Optional customer ID.",
                        },
                        "items": {
                            "type": "array",
                            "description": "List of items, each with product_id and quantity.",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "product_id": {
                                        "anyOf": [
                                            {"type": "string"},
                                            {"type": "number"}
                                        ]
                                    },
                                    "quantity": {"type": "integer"},
                                },
                                "required": ["product_id", "quantity"],
                            },
                        },
                        "delivery_address": {
                            "type": "string",
                            "description": "Optional delivery address if the customer requested delivery.",
                        },
                    },
                    "required": ["items"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_customer_by_phone",
                "description": "Look up a customer by phone number.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "phone": {
                            "type": "string",
                            "description": "Customer phone number.",
                        }
                    },
                    "required": ["phone"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_previous_orders",
                "description": "Get recent orders for a customer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_id": {
                            "anyOf": [
                                {"type": "string"},
                                {"type": "number"}
                            ],
                            "description": "Customer ID.",
                        }
                    },
                    "required": ["customer_id"],
                },
            },
        },
    ]


def _execute_tool_call(name: str, args: dict[str, Any]) -> Any:
    func = TOOLS.get(name)
    if not func:
        return {"error": f"Unknown tool: {name}"}
    try:
        normalized = _normalize_args(name, args)
        return func(**normalized)
    except Exception as exc:
        return {"error": str(exc)}


def _normalize_args(name: str, args: dict[str, Any]) -> dict[str, Any]:
    aliases = {
        "search_inventory": {"search_query": "query"},
        "create_order": {"order_items": "items"},
    }
    mapping = aliases.get(name, {})
    normalized = {mapping.get(k, k): v for k, v in args.items()}

    for id_field in ("product_id", "order_id"):
        if id_field in normalized and isinstance(normalized[id_field], (int, float)):
            normalized[id_field] = str(int(normalized[id_field]))

    return normalized


class StoreAgent:
    def __init__(self) -> None:
        self.tools = TOOLS

    async def run(self, state: AgentState) -> AgentState:
        client = _get_client()
        tools_def = _build_tool_definitions()

        messages: list[dict] = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": state.raw_input},
        ]

        tool_results: dict[str, Any] = {}
        max_iterations = 10

        for _ in range(max_iterations):
            response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                tools=tools_def,
                tool_choice="auto",
            )

            message = response.choices[0].message

            if message.tool_calls:
                print(f"[agent] Groq requested {len(message.tool_calls)} tool(s)")
                messages.append(
                    {
                        "role": "assistant",
                        "content": message.content,
                        "tool_calls": [
                            {
                                "id": tc.id,
                                "type": tc.type,
                                "function": {
                                    "name": tc.function.name,
                                    "arguments": tc.function.arguments,
                                },
                            }
                            for tc in message.tool_calls
                        ],
                    }
                )

                tool_response_messages = []
                for tc in message.tool_calls:
                    name = tc.function.name
                    try:
                        args = json.loads(tc.function.arguments or "{}")
                    except json.JSONDecodeError:
                        args = {}
                    normalized = _normalize_args(name, args)
                    print(f"[agent] Groq requested tool: {name} args={normalized}")
                    result = _execute_tool_call(name, normalized)
                    tool_results[name] = result
                    result_str = json.dumps(result, default=str) if not isinstance(result, str) else result
                    print(f"[agent] Tool result for {name}: {result_str[:200]}")
                    tool_response_messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "content": result_str,
                        }
                    )

                messages.extend(tool_response_messages)
                continue

            text = (message.content or "").strip()
            if text:
                print(f"[agent] Groq final response: {text[:100]}")
                state.confirmation_message = text
                state.success = True

                if "create_order" in tool_results:
                    order = tool_results["create_order"]
                    state.order_id = order.get("id")
                    state.items = order.get("items")
                    state.order_total = order.get("total_amount")
                    state.delivery_created = bool(order.get("delivery_address"))

                return state

            state.error = "Empty response from model."
            state.success = False
            return state

        state.error = "Agent stopped: maximum tool-call iterations reached."
        state.success = False
        return state


_log_safe_config()

agent = StoreAgent()
