from fastapi import APIRouter
from .auth import router as auth_router
from .bundles import router as bundles_router
from .categories import router as categories_router
from .orders import router as orders_router
from .payments import router as payments_router
from .downloads import router as downloads_router
from .ai_generation import router as ai_router
from .admin import router as admin_router
from .users import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
api_router.include_router(bundles_router, prefix="/bundles", tags=["Bundles"])
api_router.include_router(orders_router, prefix="/orders", tags=["Orders"])
api_router.include_router(payments_router, prefix="/payments", tags=["Payments"])
api_router.include_router(downloads_router, prefix="/downloads", tags=["Downloads"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Generation"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
