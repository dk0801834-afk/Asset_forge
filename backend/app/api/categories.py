from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_active_admin, get_current_user
from ..models.category import Category
from ..models.user import User
from ..schemas.category import CategoryResponse, CategoryCreate, CategoryUpdate

router = APIRouter()


@router.get("", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """List all active categories (public)."""
    categories = (
        db.query(Category)
        .filter(Category.is_active == True)
        .order_by(Category.sort_order, Category.name)
        .all()
    )
    return [CategoryResponse.model_validate(c) for c in categories]


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    """Admin: Create new category."""
    existing = db.query(Category).filter(Category.slug == cat_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    cat = Category(**cat_data.model_dump(), is_active=True)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    update_data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    """Admin: Update category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    """Admin: Soft-delete category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.is_active = False
    db.commit()
    return None
