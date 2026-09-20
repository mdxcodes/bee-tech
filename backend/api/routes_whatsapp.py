import hashlib
import hmac
import os
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import PlainTextResponse

from backend.services.whatsapp import (
    send_text_message,
    send_template_message,
    is_configured,
    get_test_number,
    WHATSAPP_WEBHOOK_VERIFY_TOKEN,
)

router = APIRouter()


@router.get("/webhook/whatsapp")
async def verify_webhook(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == WHATSAPP_WEBHOOK_VERIFY_TOKEN:
        return PlainTextResponse(content=challenge or "", status_code=200)

    raise HTTPException(status_code=403, detail="Webhook verification failed")


@router.post("/webhook/whatsapp")
async def receive_webhook(request: Request):
    body = await request.json()

    try:
        entries = body.get("entry", [])
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                if "messages" not in value:
                    continue

                for message in value.get("messages", []):
                    phone_number = message.get("from", "")
                    message_type = message.get("type", "")
                    text_body = ""

                    if message_type == "text":
                        text_body = message.get("text", {}).get("body", "")

                    if text_body:
                        from agent.state import AgentState
                        from agent.graph import StoreAgent

                        state = AgentState(
                            raw_input=text_body,
                            channel="whatsapp",
                            customer_identifier=phone_number,
                        )
                        agent = StoreAgent()
                        result = await agent.run(state)

                        if result.success and result.confirmation_message:
                            await send_text_message(phone_number, result.confirmation_message)

    except Exception:
        pass

    return {"status": "ok"}


@router.post("/whatsapp/send")
async def send_whatsapp_message(request: Request):
    if not is_configured():
        raise HTTPException(status_code=503, detail="WhatsApp is not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env")

    body = await request.json()
    to = body.get("to", get_test_number())
    message = body.get("message", "")

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    result = await send_text_message(to, message)
    return {"success": True, "result": result}


@router.post("/whatsapp/send-template")
async def send_whatsapp_template(request: Request):
    if not is_configured():
        raise HTTPException(status_code=503, detail="WhatsApp is not configured.")

    body = await request.json()
    to = body.get("to", get_test_number())
    template_name = body.get("template", "hello_world")

    result = await send_template_message(to, template_name)
    return {"success": True, "result": result}


@router.get("/whatsapp/test")
async def test_whatsapp():
    if not is_configured():
        raise HTTPException(status_code=503, detail="WhatsApp is not configured.")

    test_number = get_test_number()
    result = await send_text_message(
        test_number,
        "🧪 Test message from Kirana Store AI Operator backend. WhatsApp integration is working!",
    )
    return {"success": True, "sent_to": test_number, "result": result}


@router.get("/whatsapp/status")
async def whatsapp_status():
    return {
        "configured": is_configured(),
        "phone_number_id": WHATSAPP_PHONE_NUMBER_ID or "not set",
        "test_number": get_test_number(),
    }
