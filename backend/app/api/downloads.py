import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import verify_download_token
from ..core.config import settings
from ..models.order import OrderItem, Order, OrderStatus
from ..models.download import DownloadLog
from ..models.user import User

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/{token}")
def download_file(
    token: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Download a purchased bundle using a time-limited signed token."""
    data = verify_download_token(token)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Download link is invalid or has expired.",
        )

    order_id = data["order_id"]
    bundle_id = data["bundle_id"]
    user_id = data["user_id"]

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Token mismatch")
    if order.status not in (OrderStatus.PAID, OrderStatus.COMPLETED, OrderStatus.PROCESSING):
        raise HTTPException(status_code=403, detail="Payment not confirmed")

    item = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order_id, OrderItem.bundle_id == bundle_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Bundle not found in this order")

    # Verify token matches the stored one (single token validity)
    if item.download_token != token:
        raise HTTPException(status_code=403, detail="This download link is no longer valid")

    zip_path = Path(item.zip_file_path) if item.zip_file_path else None

    if not zip_path or not zip_path.exists():
        # Generate the ZIP on-the-fly if not already present
        from ..services.packaging_service import packaging_service
        from ..models.bundle import Bundle
        bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
        if bundle:
            zip_path = packaging_service._create_bundle_zip(bundle, order)
            if zip_path:
                item.zip_file_path = str(zip_path)
                db.commit()

    if not zip_path or not zip_path.exists():
        raise HTTPException(status_code=404, detail="Download file not available")

    # Log the download
    try:
        ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")
        log = DownloadLog(
            order_id=order_id,
            order_item_id=item.id,
            user_id=user_id,
            ip_address=ip,
            user_agent=user_agent[:500] if user_agent else None,
        )
        db.add(log)
        db.commit()
    except Exception as e:
        logger.warning(f"Failed to log download: {e}")

    safe_filename = f"{item.bundle_slug}.zip"
    return FileResponse(
        path=str(zip_path),
        filename=safe_filename,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Cache-Control": "private, max-age=300",
        },
    )
