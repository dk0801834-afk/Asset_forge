import json
import logging
from fastapi import APIRouter, Depends, Request, HTTPException, BackgroundTasks, Header
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.config import settings
from ..services.payment_service import payment_service
from ..services.packaging_service import packaging_service
from ..models.order import Order, OrderStatus

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    """Secure Stripe webhook endpoint. Verifies signature then processes events."""
    payload = await request.body()

    if not payment_service.enabled:
        logger.info("[MOCK] Webhook received (Stripe not configured)")
        return {"status": "received"}

    event = payment_service.construct_webhook_event(payload, stripe_signature)
    if not event:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    event_type = event.get("type", "")
    logger.info(f"Processing Stripe webhook: {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        order = payment_service.handle_checkout_completed(db, session)
        if order:
            # Trigger async fulfillment: ZIP packaging + email
            background_tasks.add_task(packaging_service.fulfill_order, db, order)

    elif event_type == "checkout.session.async_payment_succeeded":
        session = event["data"]["object"]
        order = payment_service.handle_checkout_completed(db, session)
        if order:
            background_tasks.add_task(packaging_service.fulfill_order, db, order)

    elif event_type == "checkout.session.async_payment_failed":
        session = event["data"]["object"]
        order_id = session.get("metadata", {}).get("order_id")
        if order_id:
            order = db.query(Order).filter(Order.id == int(order_id)).first()
            if order:
                order.status = OrderStatus.FAILED
                db.commit()
                logger.warning(f"Async payment failed for order {order.order_number}")

    return {"status": "success", "event": event_type}


@router.get("/config")
def get_payment_config():
    """Public: Expose publishable key for frontend."""
    return {
        "publishableKey": settings.STRIPE_PUBLISHABLE_KEY,
        "enabled": payment_service.enabled,
    }
