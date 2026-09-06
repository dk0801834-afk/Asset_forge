import uuid
from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.order import Order, OrderItem, OrderStatus
from ..models.bundle import Bundle
from ..schemas.order import OrderResponse, OrderCreate, CheckoutSessionResponse
from ..services.payment_service import payment_service
from ..services.packaging_service import packaging_service

router = APIRouter()


def _generate_order_number() -> str:
    return f"AF-{uuid.uuid4().hex[:8].upper()}"


@router.post("/checkout", response_model=CheckoutSessionResponse)
def create_checkout(
    checkout_data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an order and initiate Stripe checkout."""
    if not checkout_data.bundle_ids:
        raise HTTPException(status_code=400, detail="No bundles selected")

    # Fetch bundles and calculate totals
    bundles = []
    subtotal = Decimal("0")
    for bid in checkout_data.bundle_ids:
        bundle = db.query(Bundle).filter(Bundle.id == bid, Bundle.is_active == True).first()
        if not bundle:
            raise HTTPException(status_code=404, detail=f"Bundle {bid} not found or unavailable")
        bundles.append(bundle)
        subtotal += bundle.price

    tax = Decimal("0")  # Could integrate Stripe Tax or TaxJar in production
    total = subtotal + tax

    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=_generate_order_number(),
        status=OrderStatus.PENDING,
        subtotal=subtotal,
        tax=tax,
        total=total,
        currency="USD",
        customer_email=current_user.email,
        customer_name=current_user.full_name,
    )
    db.add(order)
    db.flush()

    for bundle in bundles:
        item = OrderItem(
            order_id=order.id,
            bundle_id=bundle.id,
            bundle_name=bundle.name,
            bundle_slug=bundle.slug,
            price_paid=bundle.price,
            quantity=1,
        )
        db.add(item)

    db.commit()
    db.refresh(order)

    # Create payment session
    try:
        result = payment_service.create_checkout_session(db, current_user, bundles, order)
    except Exception as e:
        db.delete(order)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to create checkout: {str(e)}")

    # In mock mode, auto-fulfill for demo
    if not payment_service.enabled and order.status == OrderStatus.PAID:
        background_tasks.add_task(packaging_service.fulfill_order, db, order)

    return CheckoutSessionResponse(**result)


@router.get("", response_model=List[OrderResponse])
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List current user's orders."""
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [OrderResponse.model_validate(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific order. Users can only access their own orders."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return OrderResponse.model_validate(order)
