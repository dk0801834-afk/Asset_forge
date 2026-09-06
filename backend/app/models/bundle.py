from sqlalchemy import Column, String, Text, Numeric, Boolean, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class Bundle(BaseModel):
    __tablename__ = "bundles"

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    long_description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), default="USD", nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    preview_images = Column(JSON, default=list, nullable=False)  # Array of image URLs
    asset_count = Column(Integer, default=0, nullable=False)
    file_formats = Column(JSON, default=list, nullable=False)  # ["PNG", "SVG", "BLEND", etc.]
    file_size_mb = Column(Numeric(10, 2), nullable=True)
    tags = Column(JSON, default=list, nullable=False)  # Search tags
    features = Column(JSON, default=list, nullable=False)  # List of feature strings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    stripe_product_id = Column(String(255), nullable=True)
    stripe_price_id = Column(String(255), nullable=True)

    category = relationship("Category", back_populates="bundles")
    assets = relationship("BundleAsset", back_populates="bundle", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="bundle")


class BundleAsset(BaseModel):
    __tablename__ = "bundle_assets"

    bundle_id = Column(Integer, ForeignKey("bundles.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0, nullable=False)  # bytes
    mime_type = Column(String(100), nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    bundle = relationship("Bundle", back_populates="assets")
