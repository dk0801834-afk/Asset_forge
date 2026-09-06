from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import ValidationError

from ..core.database import get_db
from ..core.security import verify_password, create_access_token, get_current_user
from ..core.config import settings
from ..models.user import User, UserRole
from ..models.tenant import Tenant
from ..schemas.user import UserCreate, UserResponse, TokenResponse
from ..services.email_service import email_service

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new customer account."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Get or create default tenant
    tenant = db.query(Tenant).filter(Tenant.slug == "assetforge").first()
    if not tenant:
        tenant = Tenant(name="AssetForge", slug="assetforge", is_active=True)
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

    from ..core.security import hash_password
    user = User(
        tenant_id=tenant.id,
        email=user_data.email.lower(),
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        role=UserRole.CUSTOMER,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id)
    # Send welcome email (non-blocking on failure)
    try:
        email_service.send_welcome_email(user.email, user.full_name)
    except Exception:
        pass

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible login, returns JWT token."""
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserResponse.model_validate(current_user)
