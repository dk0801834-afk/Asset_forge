import enum
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class AIRequestStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AIGenerationRequest(BaseModel):
    __tablename__ = "ai_generation_requests"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    negative_prompt = Column(Text, nullable=True)
    style_preset = Column(String(100), nullable=True)
    width = Column(Integer, default=1024, nullable=False)
    height = Column(Integer, default=1024, nullable=False)
    num_images = Column(Integer, default=1, nullable=False)
    status = Column(Enum(AIRequestStatus), default=AIRequestStatus.PENDING, nullable=False, index=True)
    result_urls = Column(JSON, default=list, nullable=False)
    error_message = Column(Text, nullable=True)
    credits_charged = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="ai_requests")
