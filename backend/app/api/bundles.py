from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from ..core.database import get_db
from ..core.security import get_current_active_admin, get_current_user
from ..models.bundle import Bundle
from ..models.category import Category
from ..models.user import User
from ..schemas.bundle import (
    BundleListResponse, BundleDetailResponse, BundleCreate, BundleUpdate
)

router = APIRouter()


@router.get("", response_model=List[BundleListResponse])
def list_bundles(
    db: Session = Depends(get_db),
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    search: Optional[str] = Query(None, max_length=200),
    tag: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    featured_only: bool = False,
    sort: str = Query("newest", pattern=r"^(newest|price_asc|price_desc|popular)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Public: List bundles with filtering and search."""
    query = db.query(Bundle).filter(Bundle.is_active == True)

    if category_id:
        query = query.filter(Bundle.category_id == category_id)
    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Bundle.category_id == cat.id)
    if featured_only:
        query = query.filter(Bundle.is_featured == True)
    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(
            Bundle.name.ilike(search_term),
            Bundle.description.ilike(search_term),
            Bundle.tagline.ilike(search_term),
        ))
    if tag:
        # JSON contains check - SQLite/PG compatible fallback via string match
        query = query.filter(Bundle.tags.like(f'%"{tag}"%'))
    if min_price is not None:
        query = query.filter(Bundle.price >= min_price)
    if max_price is not None:
        query = query.filter(Bundle.price <= max_price)

    if sort == "price_asc":
        query = query.order_by(Bundle.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Bundle.price.desc())
    elif sort == "popular":
        query = query.order_by(Bundle.is_featured.desc(), Bundle.created_at.desc())
    else:
        query = query.order_by(Bundle.created_at.desc())

    bundles = query.offset(offset).limit(limit).all()
    return [BundleListResponse.model_validate(b) for b in bundles]


@router.get("/featured", response_model=List[BundleListResponse])
def get_featured_bundles(db: Session = Depends(get_db), limit: int = Query(8, ge=1, le=20)):
    """Public: Get featured bundles."""
    bundles = (
        db.query(Bundle)
        .filter(Bundle.is_active == True, Bundle.is_featured == True)
        .order_by(Bundle.created_at.desc())
        .limit(limit)
        .all()
    )
    return [BundleListResponse.model_validate(b) for b in bundles]


@router.get("/by-slug/{slug}", response_model=BundleDetailResponse)
def get_bundle_by_slug(slug: str, db: Session = Depends(get_db)):
    """Public: Get bundle details by slug."""
    bundle = db.query(Bundle).filter(Bundle.slug == slug, Bundle.is_active == True).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return BundleDetailResponse.model_validate(bundle)


@router.get("/{bundle_id}", response_model=BundleDetailResponse)
def get_bundle(bundle_id: int, db: Session = Depends(get_db)):
    """Public: Get bundle details by ID."""
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id, Bundle.is_active == True).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    return BundleDetailResponse.model_validate(bundle)


@router.post("", response_model=BundleDetailResponse, status_code=status.HTTP_201_CREATED)
def create_bundle(
    bundle_data: BundleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    """Admin: Create new bundle."""
    existing = db.query(Bundle).filter(Bundle.slug == bundle_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bundle slug already exists")
    cat = db.query(Category).filter(Category.id == bundle_data.category_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Category does not exist")
    bundle = Bundle(**bundle_data.model_dump(), is_active=True)
    db.add(bundle)
    db.commit()
    db.refresh(bundle)
    return BundleDetailResponse.model_validate(bundle)


@router.patch("/{bundle_id}", response_model=BundleDetailResponse)
def update_bundle(
    bundle_id: int,
    update_data: BundleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    """Admin: Update bundle."""
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(bundle, field, value)
    db.commit()
    db.refresh(bundle)
    return BundleDetailResponse.model_validate(bundle)


@router.delete("/{bundle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bundle(
    bundle_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    """Admin: Soft-delete bundle."""
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=404, detail="Bundle not found")
    bundle.is_active = False
    db.commit()
    return None
