from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from decimal import Decimal

from ..core.database import get_db
from ..core.security import get_current_active_admin, hash_password
from ..models.user import User, UserRole
from ..models.order import Order, OrderStatus
from ..models.bundle import Bundle
from ..models.category import Category
from ..schemas.user import UserResponse, AdminUserUpdate
from ..schemas.order import OrderAdminResponse
from ..services.packaging_service import packaging_service
from ..services.payment_service import payment_service

router = APIRouter()


# ---- Admin User Management ----

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        like = f"%{search}%"
        query = query.filter(User.email.ilike(like) | User.full_name.ilike(like))
    users = query.order_by(User.created_at.desc()).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    update_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


# ---- Admin Order Management ----

@router.get("/orders", response_model=List[OrderAdminResponse])
def list_all_orders(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return [OrderAdminResponse.model_validate(o) for o in orders]


@router.post("/orders/{order_id}/refund", response_model=OrderAdminResponse)
def refund_order(
    order_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    success = payment_service.create_refund(db, order)
    if not success:
        raise HTTPException(status_code=500, detail="Refund failed")
    db.refresh(order)
    return OrderAdminResponse.model_validate(order)


@router.post("/orders/{order_id}/resend-download", response_model=OrderAdminResponse)
def resend_download_email(
    order_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    background_tasks.add_task(packaging_service.fulfill_order, db, order)
    db.refresh(order)
    return OrderAdminResponse.model_validate(order)


# ---- Admin Stats ----

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    from sqlalchemy import func
    total_users = db.query(func.count(User.id)).filter(User.role == UserRole.CUSTOMER).scalar()
    total_bundles = db.query(func.count(Bundle.id)).filter(Bundle.is_active == True).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    paid_orders = db.query(func.count(Order.id)).filter(Order.status.in_([OrderStatus.PAID, OrderStatus.COMPLETED])).scalar()
    revenue = db.query(func.coalesce(func.sum(Order.total), 0)).filter(Order.status.in_([OrderStatus.PAID, OrderStatus.COMPLETED])).scalar()

    recent_orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_users": total_users or 0,
        "total_bundles": total_bundles or 0,
        "total_orders": total_orders or 0,
        "paid_orders": paid_orders or 0,
        "total_revenue": float(revenue or 0),
        "recent_orders": [OrderAdminResponse.model_validate(o) for o in recent_orders],
    }
