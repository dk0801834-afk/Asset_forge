from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from decimal import Decimal


class BundleAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    file_size: int
    mime_type: Optional[str] = None
    sort_order: int


class BundleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    tagline: Optional[str] = None
    description: str = Field(..., min_length=10)
    long_description: Optional[str] = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    compare_at_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    currency: str = Field("USD", min_length=3, max_length=3)
    thumbnail_url: Optional[str] = None
    preview_images: List[str] = []
    asset_count: int = Field(0, ge=0)
    file_formats: List[str] = []
    file_size_mb: Optional[Decimal] = None
    tags: List[str] = []
    features: List[str] = []
    is_featured: bool = False


class BundleCreate(BundleBase):
    category_id: int


class BundleUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = Field(None, min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    tagline: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    compare_at_price: Optional[Decimal] = None
    currency: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preview_images: Optional[List[str]] = None
    asset_count: Optional[int] = Field(None, ge=0)
    file_formats: Optional[List[str]] = None
    file_size_mb: Optional[Decimal] = None
    tags: Optional[List[str]] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    category_id: Optional[int] = None


class BundleListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    tagline: Optional[str] = None
    description: str
    price: Decimal
    compare_at_price: Optional[Decimal] = None
    currency: str
    thumbnail_url: Optional[str] = None
    asset_count: int
    file_formats: List[str]
    file_size_mb: Optional[Decimal] = None
    tags: List[str]
    is_featured: bool
    category_id: int
    created_at: datetime


class BundleDetailResponse(BundleListResponse):
    long_description: Optional[str] = None
    preview_images: List[str]
    features: List[str]
    is_active: bool
    category: "CategoryResponse" = None


from .category import CategoryResponse
BundleDetailResponse.model_rebuild()
