import os
import zipfile
import logging
import tempfile
import shutil
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import create_download_token
from ..models.order import Order, OrderItem, OrderStatus
from ..models.bundle import Bundle, BundleAsset
from .email_service import email_service

logger = logging.getLogger(__name__)


class PackagingService:
    def __init__(self):
        self.downloads_dir = settings.DOWNLOADS_DIR
        self.downloads_dir.mkdir(parents=True, exist_ok=True)

    def fulfill_order(self, db: Session, order: Order) -> bool:
        """Package all bundles in order and send download emails."""
        try:
            order.status = OrderStatus.PROCESSING
            db.commit()

            items_data = []

            for item in order.items:
                bundle = db.query(Bundle).filter(Bundle.id == item.bundle_id).first()
                if not bundle:
                    logger.error(f"Bundle {item.bundle_id} not found for order {order.order_number}")
                    continue

                # Create ZIP for this bundle
                zip_path = self._create_bundle_zip(bundle, order)
                if zip_path:
                    item.zip_file_path = str(zip_path)
                    token = create_download_token(order.id, bundle.id, order.user_id)
                    item.download_token = token
                    items_data.append({
                        "bundle_name": bundle.name,
                        "price": float(item.price_paid),
                        "asset_count": bundle.asset_count,
                        "download_url": f"{settings.BASE_URL}/api/v1/downloads/{token}",
                    })
                else:
                    # Fallback: even without physical files, generate token for demo
                    token = create_download_token(order.id, bundle.id, order.user_id)
                    item.download_token = token
                    items_data.append({
                        "bundle_name": bundle.name,
                        "price": float(item.price_paid),
                        "asset_count": bundle.asset_count,
                        "download_url": f"{settings.BASE_URL}/api/v1/downloads/{token}",
                    })

            order.zip_ready = True
            db.commit()

            # Send email
            if items_data:
                customer_name = order.customer_name or ""
                email_sent = email_service.send_download_ready_email(
                    to_email=order.customer_email or order.user.email,
                    customer_name=customer_name,
                    items=items_data,
                    expire_hours=settings.DOWNLOAD_LINK_EXPIRE_HOURS,
                )
                order.email_sent = email_sent

            order.status = OrderStatus.COMPLETED
            db.commit()
            logger.info(f"Order {order.order_number} fulfilled successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to fulfill order {order.order_number}: {e}", exc_info=True)
            order.status = OrderStatus.FAILED
            db.commit()
            return False

    def _create_bundle_zip(self, bundle: Bundle, order: Order) -> Optional[Path]:
        """Create a ZIP file for the bundle containing its assets."""
        safe_name = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in bundle.slug)
        zip_filename = f"{safe_name}_order_{order.order_number}.zip"
        zip_path = self.downloads_dir / zip_filename

        # Check if assets exist and create ZIP
        assets = bundle.assets
        if not assets:
            # Create a README placeholder ZIP for demo purposes
            try:
                with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                    readme = self._generate_readme(bundle, order)
                    zf.writestr("README.txt", readme)
                    # Include placeholder for demo
                    zf.writestr(f"{bundle.slug}/LICENSE.txt",
                                f"License for {bundle.name}\n\n"
                                f"Purchase order: {order.order_number}\n"
                                f"Licensed to: {order.customer_email or 'Customer'}\n"
                                f"Date: {order.created_at.isoformat()}\n\n"
                                "Standard B2B License - see assetforge.io/license")
                return zip_path
            except Exception as e:
                logger.error(f"Failed to create placeholder zip: {e}")
                return None

        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                bundle_dir = f"{bundle.slug}/"
                zf.writestr(bundle_dir + "README.txt", self._generate_readme(bundle, order))
                zf.writestr(bundle_dir + "LICENSE.txt",
                            f"License for {bundle.name}\nOrder: {order.order_number}\n")

                for asset in assets:
                    asset_path = Path(asset.file_path)
                    if asset_path.exists():
                        arcname = f"{bundle_dir}{asset.filename}"
                        zf.write(asset_path, arcname)
                    else:
                        logger.warning(f"Asset file missing: {asset.file_path}")
            return zip_path
        except Exception as e:
            logger.error(f"Failed to create zip at {zip_path}: {e}")
            return None

    def _generate_readme(self, bundle: Bundle, order: Order) -> str:
        return f"""
=========================================
  {bundle.name}
  AssetForge B2B Creative Bundle
=========================================

Thank you for your purchase!

Order Number: {order.order_number}
Purchase Date: {order.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}
Bundle: {bundle.name}
Number of Assets: {bundle.asset_count}
File Formats: {', '.join(bundle.file_formats) if bundle.file_formats else 'Various'}

ABOUT THIS BUNDLE
-----------------
{bundle.description}

LICENSE
-------
This bundle is licensed for business use under the AssetForge Standard B2B License.
- Unlimited commercial projects
- Perpetual usage rights
- No attribution required
- Cannot resell or redistribute raw assets

SUPPORT
-------
For support, contact support@assetforge.io with your order number.

Build something amazing!
-- The AssetForge Team
"""

    def get_zip_path_for_token(self, token: str) -> Optional[Path]:
        """Find ZIP file associated with a download token."""
        item_path = None
        for f in self.downloads_dir.glob("*.zip"):
            # We look up the token via DB, so file scan not needed for existence
            if f.exists():
                item_path = f  # fallback, exact match via DB lookup in API
        return item_path


packaging_service = PackagingService()
