from sqlalchemy import Column, String, Boolean, Text
from sqlalchemy.orm import relationship
from .base import BaseModel


class Tenant(BaseModel):
    __tablename__ = "tenants"

    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(255), unique=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    settings = Column(Text, nullable=True)  # JSON-serialized settings

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
