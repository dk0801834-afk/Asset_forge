import logging
import stripe
from typing import List, Optional
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.bundle import Bundle
from ..models.order import Order, OrderItem, OrderStatus
from ..models.user import User

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentService:
    def __init__(self):
        self.enabled = bool(settings.STRIPE_SECRET_KEY and settings.STRIPE_SECRET_KEY.startswith(("sk_test_", "sk_live_")))
        if not self.enabled:
            logger.warning("Stripe is not configured. Running in mock mode.")

    def create_checkout_session(
        self,
        db: Session,
        user: User,
        bundles: List[Bundle],
        order: Order
    ) -> Optional[dict]:
        """Create Stripe checkout session. Returns (session_id, checkout_url)."""

        if not self.enabled:
            # Mock mode - return a fake session that will be auto-fulfilled
            logger.info(f"[MOCK] Would create Stripe session for order {order.order_number}")
            # Auto-mark as paid for demo purposes
            order.stripe_session_id = f"mock_session_{order.id}"
            order.status = OrderStatus.PAID
            db.commit()
            return {
                "session_id": order.stripe_session_id,
                "checkout_url": f"{settings.FRONTEND_URL}/orders/{order.id}?demo=paid"
            }

        try:
            line_items = []
            for bundle in bundles:
                # Ensure we have a Stripe price ID; create if needed
                price_id = bundle.stripe_price_id
                if not price_id:
                    price_id = self._ensure_stripe_product(db, bundle)

                line_items.append({
                    "price": price_id,
                    "quantity": 1,
                })

            checkout_session = stripe.checkout.Session.create(
                customer_email=user.email,
                client_reference_id=str(order.id),
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url=f"{settings.FRONTEND_URL}/orders/{order.id}?success=true&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL}/checkout?canceled=true",
                metadata={
                    "order_id": str(order.id),
                    "order_number": order.order_number,
                    "user_id": str(user.id),
                },
                payment_intent_data={
                    "metadata": {
                        "order_id": str(order.id),
                        "user_id": str(user.id),
                    }
                },
            )

            order.stripe_session_id = checkout_session.id
            db.commit()

            return {
                "session_id": checkout_session.id,
                "checkout_url": checkout_session.url,
            }
        except Exception as e:
            logger.error(f"Failed to create Stripe session: {str(e)}")
            raise

    def _ensure_stripe_product(self, db: Session, bundle: Bundle) -> str:
        """Create Stripe product/price if they don't exist."""
        try:
            if bundle.stripe_product_id:
                product = stripe.Product.retrieve(bundle.stripe_product_id)
            else:
                product = stripe.Product.create(
                    name=bundle.name,
                    description=bundle.tagline or b.description[:200] if (b := bundle) else bundle.name,
                    images=[bundle.thumbnail_url] if bundle.thumbnail_url else [],
                    metadata={"bundle_id": str(bundle.id), "slug": bundle.slug},
                )
                bundle.stripe_product_id = product.id

            price = stripe.Price.create(
                product=product.id,
                unit_amount=int(bundle.price * 100),  # cents
                currency=bundle.currency.lower(),
            )
            bundle.stripe_price_id = price.id
            db.commit()
            return price.id
        except Exception as e:
            logger.error(f"Failed to create Stripe product for bundle {bundle.id}: {e}")
            raise

    def construct_webhook_event(self, payload: bytes, sig_header: str):
        """Verify and construct Stripe webhook event."""
        if not self.enabled:
            return None
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.error(f"Webhook signature verification failed: {e}")
            return None

    def handle_checkout_completed(self, db: Session, session: dict) -> Optional[Order]:
        """Process successful checkout. Mark order paid and trigger fulfillment."""
        order_id = session.get("metadata", {}).get("order_id")
        if not order_id:
            client_ref = session.get("client_reference_id")
            order_id = client_ref

        if not order_id:
            logger.error("No order_id in checkout session metadata")
            return None

        order = db.query(Order).filter(Order.id == int(order_id)).first()
        if not order:
            logger.error(f"Order {order_id} not found")
            return None

        if order.status == OrderStatus.PAID or order.status == OrderStatus.COMPLETED:
            logger.info(f"Order {order.order_number} already processed")
            return order

        order.status = OrderStatus.PAID
        order.stripe_payment_intent_id = session.get("payment_intent")
        order.customer_email = session.get("customer_details", {}).get("email", order.customer_email)
        order.customer_name = session.get("customer_details", {}).get("name", order.customer_name)
        db.commit()
        db.refresh(order)

        logger.info(f"Payment confirmed for order {order.order_number}")
        return order

    def create_refund(self, db: Session, order: Order) -> bool:
        """Refund a payment."""
        if not self.enabled or not order.stripe_payment_intent_id:
            logger.info(f"[MOCK] Refunding order {order.order_number}")
            order.status = OrderStatus.REFUNDED
            db.commit()
            return True
        try:
            stripe.Refund.create(payment_intent=order.stripe_payment_intent_id)
            order.status = OrderStatus.REFUNDED
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Refund failed: {e}")
            return False


payment_service = PaymentService()
