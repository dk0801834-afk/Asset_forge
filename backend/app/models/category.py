from sqlalchemy import Column, String, Text, Integer, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel


class Category(BaseModel):
    __tablename__ = "categories"

    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    image_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    bundles = relationship("Bundle", back_populates="category")
