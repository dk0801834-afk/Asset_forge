import logging
import httpx
import base64
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.ai_generation import AIGenerationRequest, AIRequestStatus
from ..models.user import User

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.api_url = settings.AI_API_URL
        self.enabled = bool(self.api_key) and not self.api_key.startswith("your_")
        self.output_dir = settings.ASSETS_DIR / "ai_generated"
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def generate_images(self, db: Session, user: User, request_data: dict) -> AIGenerationRequest:
        """Submit an AI generation request. Returns the DB record."""
        ai_request = AIGenerationRequest(
            user_id=user.id,
            prompt=request_data["prompt"],
            negative_prompt=request_data.get("negative_prompt"),
            style_preset=request_data.get("style_preset"),
            width=request_data.get("width", 1024),
            height=request_data.get("height", 1024),
            num_images=request_data.get("num_images", 1),
            status=AIRequestStatus.PROCESSING,
        )
        db.add(ai_request)
        db.commit()
        db.refresh(ai_request)

        try:
            result_urls = await self._call_ai_api(ai_request)
            ai_request.result_urls = result_urls
            ai_request.status = AIRequestStatus.COMPLETED
            ai_request.credits_charged = ai_request.num_images
        except Exception as e:
            logger.error(f"AI generation failed for request {ai_request.id}: {e}", exc_info=True)
            ai_request.status = AIRequestStatus.FAILED
            ai_request.error_message = str(e)[:1000]

        db.commit()
        db.refresh(ai_request)
        return ai_request

    async def _call_ai_api(self, request: AIGenerationRequest) -> List[str]:
        """Call AI image generation API. Falls back to placeholder generation if not configured."""
        if not self.enabled:
            logger.info("[MOCK] AI API not configured; generating placeholder responses")
            return await self._generate_mock(request)

        # Stability AI style API call (adaptable for other providers)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        payload = {
            "text_prompts": [{"text": request.prompt, "weight": 1.0}],
            "cfg_scale": 7,
            "width": request.width,
            "height": request.height,
            "steps": 30,
            "samples": request.num_images,
        }

        if request.negative_prompt:
            payload["text_prompts"].append({"text": request.negative_prompt, "weight": -1.0})
        if request.style_preset:
            payload["style_preset"] = request.style_preset

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

        result_urls = []
        for i, artifact in enumerate(data.get("artifacts", [])):
            img_bytes = base64.b64decode(artifact["base64"])
            filename = f"ai_{request.id}_{i}_{int(datetime.utcnow().timestamp())}.png"
            filepath = self.output_dir / filename
            with open(filepath, "wb") as f:
                f.write(img_bytes)
            url_path = f"/static/assets/ai_generated/{filename}"
            result_urls.append(url_path)

        return result_urls

    async def _generate_mock(self, request: AIGenerationRequest) -> List[str]:
        """Generate mock SVG placeholders when AI API isn't configured."""
        urls = []
        import hashlib
        for i in range(request.num_images):
            seed = hashlib.md5(f"{request.id}_{i}_{request.prompt[:50]}".encode()).hexdigest()[:6]
            # Create a colored SVG placeholder
            r, g, b = int(seed[0:2], 16), int(seed[2:4], 16), int(seed[4:6], 16)
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{request.width}" height="{request.height}" viewBox="0 0 {request.width} {request.height}">
  <defs><linearGradient id="g{i}" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:rgb({r},{g},{b});stop-opacity:1" />
    <stop offset="100%" style="stop-color:rgb({(r+60)%256},{(g+60)%256},{(b+60)%256});stop-opacity:1" />
  </linearGradient></defs>
  <rect width="{request.width}" height="{request.height}" fill="url(#g{i})"/>
  <text x="50%" y="50%" font-family="system-ui,sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">
    AI Generated Preview
  </text>
  <text x="50%" y="60%" font-family="monospace" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle" dy=".3em">
    {request.prompt[:60]}...
  </text>
</svg>'''
            filename = f"ai_{request.id}_{i}_{seed}.svg"
            filepath = self.output_dir / filename
            with open(filepath, "w") as f:
                f.write(svg)
            urls.append(f"/static/assets/ai_generated/{filename}")
        return urls


ai_service = AIService()
