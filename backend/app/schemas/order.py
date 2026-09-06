from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from decimal import Decimal
from ..models.order import OrderStatus


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    bundle_id: int
    bundle_name: str
    bundle_slug: str
    price_paid: Decimal
    quantity: int


class OrderBase(BaseModel):
    pass


class OrderCreate(BaseModel):
    bundle_ids: List[int] = Field(..., min_length=1)


class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    status: OrderStatus
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    currency: str
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []


class OrderAdminResponse(OrderResponse):
    stripe_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    email_sent: bool
    zip_ready: bool
    user_id: int
    notes: Optional[str] = None
