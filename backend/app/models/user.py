import enum
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum, Text, Integer
from sqlalchemy.orm import relationship
from .base import BaseModel


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"


class User(BaseModel):
    __tablename__ = "users"

    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    stripe_customer_id = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)

    tenant = relationship("Tenant", back_populates="users")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    ai_requests = relationship("AIGenerationRequest", back_populates="user", cascade="all, delete-orphan")
