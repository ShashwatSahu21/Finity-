"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime


# ── Auth Schemas ──────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    risk_score: Optional[int] = None
    risk_category: Optional[str] = None
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


# ── Risk Profile Schemas ──────────────────────────────────────
class RiskAnswer(BaseModel):
    question_id: int
    answer_value: int = Field(..., ge=1, le=5)


class RiskAssessmentRequest(BaseModel):
    answers: list[RiskAnswer]


class RiskAssessmentResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_category: Literal["Conservative", "Moderate", "Aggressive"]
    breakdown: dict
    recommendations: list[str]


# ── Simulator Schemas ─────────────────────────────────────────
class SimulationRequest(BaseModel):
    initial_amount: float = Field(..., gt=0)
    monthly_contribution: float = Field(default=0, ge=0)
    duration_years: int = Field(..., ge=1, le=50)
    risk_level: Literal["conservative", "moderate", "aggressive"] = "moderate"
    num_simulations: int = Field(default=1000, ge=100, le=10000)


class SimulationResult(BaseModel):
    best_case: float
    worst_case: float
    expected: float
    median: float
    percentile_25: float
    percentile_75: float
    monthly_data: list[dict]
    probability_of_loss: float
    annualized_return: float


# ── Goal Planner Schemas ──────────────────────────────────────
class GoalPlanRequest(BaseModel):
    goal_name: str
    target_amount: float = Field(..., gt=0)
    current_savings: float = Field(default=0, ge=0)
    timeline_years: int = Field(..., ge=1, le=50)
    risk_tolerance: Literal["conservative", "moderate", "aggressive"] = "moderate"


class GoalPlanResponse(BaseModel):
    goal_name: str
    target_amount: float
    monthly_savings_required: float
    total_contributions: float
    expected_returns: float
    projected_final_amount: float
    feasibility: Literal["Easy", "Moderate", "Challenging", "Very Challenging"]
    tips: list[str]


# ── Chat Schemas ──────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    user_context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str
    suggested_questions: list[str] = []


# ── Education Schemas ─────────────────────────────────────────
class LessonProgress(BaseModel):
    lesson_id: str
    completed: bool
    score: Optional[int] = None


class LearningProgressResponse(BaseModel):
    total_lessons: int
    completed_lessons: int
    current_streak: int
    total_xp: int
    level: int
    progress_percentage: float
    completed_lesson_ids: list[str]
