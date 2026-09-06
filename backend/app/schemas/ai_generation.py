from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from ..models.ai_generation import AIRequestStatus


class AIGenerationRequestCreate(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=2000)
    negative_prompt: Optional[str] = Field(None, max_length=2000)
    style_preset: Optional[str] = Field(None, max_length=100)
    width: int = Field(1024, ge=256, le=2048)
    height: int = Field(1024, ge=256, le=2048)
    num_images: int = Field(1, ge=1, le=4)


class AIGenerationRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    prompt: str
    negative_prompt: Optional[str] = None
    style_preset: Optional[str] = None
    width: int
    height: int
    num_images: int
    status: AIRequestStatus
    result_urls: List[str] = []
    error_message: Optional[str] = None
    credits_charged: int
    created_at: datetime
