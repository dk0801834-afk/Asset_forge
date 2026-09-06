import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from jinja2 import Template

from ..core.config import settings

logger = logging.getLogger(__name__)

DOWNLOAD_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .logo { font-size: 28px; font-weight: 800; color: #6366f1; margin-bottom: 30px; }
        .card { background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }
        h1 { font-size: 24px; margin: 0 0 16px 0; font-weight: 700; }
        p { color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .bundle-item { background: #0f172a; border-radius: 10px; padding: 16px; margin: 12px 0; border-left: 4px solid #6366f1; }
        .bundle-name { font-weight: 600; color: #f8fafc; }
        .footer { text-align: center; color: #64748b; font-size: 13px; margin-top: 30px; }
        .warning { color: #fbbf24; font-size: 14px; margin-top: 20px; padding: 12px; background: rgba(251,191,36,0.1); border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">⚡ AssetForge</div>
        <div class="card">
            <h1>Your download is ready!</h1>
            <p>Hi {{ customer_name }},</p>
            <p>Thank you for your purchase from AssetForge. Your B2B creative asset bundles are ready for immediate download:</p>

            {% for item in items %}
            <div class="bundle-item">
                <div class="bundle-name">{{ item.bundle_name }}</div>
                <p style="margin: 8px 0 0 0; font-size: 14px;">${{ "%.2f"|format(item.price) }} • {{ item.asset_count }} assets</p>
                <a href="{{ item.download_url }}" class="btn" style="font-size: 14px; padding: 10px 20px; margin: 12px 0 0 0;">Download ZIP</a>
            </div>
            {% endfor %}

            <div class="warning">
                ⚠️ These download links will expire in {{ expire_hours }} hours for security purposes.
            </div>

            <p style="margin-top: 24px;">If you have any questions or need assistance, reply to this email or contact our support team.</p>
            <p>Build something amazing.<br/>— The AssetForge Team</p>
        </div>
        <div class="footer">
            © 2026 AssetForge. Premium creative assets for modern teams.<br/>
            This is an automated message. Please do not reply directly.
        </div>
    </div>
</body>
</html>
"""


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM
        self.enabled = bool(self.smtp_host and self.smtp_user and self.smtp_password)

    def _send(self, to_email: str, subject: str, html_content: str, plain_content: str = "") -> bool:
        """Send email. Returns True on success. If SMTP not configured, logs and returns True (mock mode)."""
        if not self.enabled:
            logger.info(f"[DEV MODE] Email would be sent to {to_email}: {subject}")
            logger.info(f"[DEV MODE] Configure SMTP settings to enable real email delivery.")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email

            if plain_content:
                msg.attach(MIMEText(plain_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.from_email, [to_email], msg.as_string())

            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_download_ready_email(
        self,
        to_email: str,
        customer_name: str,
        items: List[dict],
        expire_hours: int = None
    ) -> bool:
        expire_hours = expire_hours or settings.DOWNLOAD_LINK_EXPIRE_HOURS

        template = Template(DOWNLOAD_EMAIL_TEMPLATE)
        html = template.render(
            customer_name=customer_name or "Valued Customer",
            items=items,
            expire_hours=expire_hours,
        )

        plain = (
            f"Hi {customer_name},\n\n"
            f"Your AssetForge purchase is ready for download!\n\n"
            f"Links expire in {expire_hours} hours.\n\n"
            "Thank you for your purchase.\n"
            "— The AssetForge Team"
        )

        subject = "Your AssetForge downloads are ready 🎉"
        return self._send(to_email, subject, html, plain)

    def send_welcome_email(self, to_email: str, full_name: str) -> bool:
        html = f"""
        <html><body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px;">
        <div style="max-width:500px; margin:auto; background:#1e293b; padding:32px; border-radius:16px;">
            <h1 style="color:#6366f1; margin-top:0;">Welcome to AssetForge, {full_name}!</h1>
            <p style="color:#cbd5e1; line-height:1.6;">Your account has been created successfully. Start browsing our premium B2B creative asset bundles and supercharge your design workflow.</p>
            <a href="{settings.FRONTEND_URL}/bundles" style="display:inline-block; background:#6366f1; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600;">Browse Bundles</a>
        </div></body></html>
        """
        return self._send(to_email, "Welcome to AssetForge!", html)


email_service = EmailService()
