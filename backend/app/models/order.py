import enum
from sqlalchemy import Column, String, Numeric, Boolean, ForeignKey, Integer, Enum, Text, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Order(BaseModel):
    __tablename__ = "orders"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False, index=True)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax = Column(Numeric(10, 2), default=0, nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    stripe_session_id = Column(String(255), unique=True, nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict, nullable=False)
    email_sent = Column(Boolean, default=False, nullable=False)
    zip_ready = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    downloads = relationship("DownloadLog", back_populates="order", cascade="all, delete-orphan")


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    bundle_id = Column(Integer, ForeignKey("bundles.id"), nullable=False)
    bundle_name = Column(String(255), nullable=False)
    bundle_slug = Column(String(100), nullable=False)
    price_paid = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    zip_file_path = Column(String(500), nullable=True)
    download_token = Column(String(500), nullable=True)

    order = relationship("Order", back_populates="items")
    bundle = relationship("Bundle", back_populates="order_items")
