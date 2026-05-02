"""
API Routes for Finity – Smart Investment Coach
All endpoints grouped by feature.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.schemas.schemas import (
    ChatRequest, ChatResponse, SimulationRequest, SimulationResult,
    RiskAssessmentRequest, RiskAssessmentResponse, GoalPlanRequest,
    GoalPlanResponse, UserRegister, UserLogin, TokenResponse, UserProfile,
)
from app.services import risk_profiler, simulator, goal_planner, ai_chat, education, gamification
from app.core.security import (
    create_access_token, get_password_hash, verify_password, decode_token,
)

router = APIRouter()


# ── Health Check ──────────────────────────────────────────────
@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Finity API", "version": "1.0.0"}


# ── Auth Routes ───────────────────────────────────────────────
@router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    """Register a new user. Uses in-memory store for demo; swap with Supabase in production."""
    hashed = get_password_hash(data.password)
    user_id = str(hash(data.email))
    user = UserProfile(id=user_id, email=data.email, full_name=data.full_name)
    token = create_access_token({"sub": user_id, "email": data.email})
    return TokenResponse(access_token=token, user=user)


@router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Login user. Demo endpoint — production should validate against Supabase."""
    user_id = str(hash(data.email))
    user = UserProfile(id=user_id, email=data.email, full_name="User")
    token = create_access_token({"sub": user_id, "email": data.email})
    return TokenResponse(access_token=token, user=user)


# ── AI Chat Routes ────────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Get AI-powered financial coaching response."""
    result = await ai_chat.get_ai_response(
        message=request.message,
        conversation_history=[m.model_dump() for m in request.conversation_history],
        user_context=request.user_context,
    )
    return ChatResponse(**result)


# ── Risk Profile Routes ──────────────────────────────────────
@router.get("/risk/questions")
async def get_risk_questions():
    """Get all risk assessment questions."""
    return {"questions": risk_profiler.get_questions()}


@router.post("/risk/assess", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """Calculate risk profile from questionnaire answers."""
    answers = [a.model_dump() for a in request.answers]
    result = risk_profiler.calculate_risk_score(answers)
    return RiskAssessmentResponse(**result)


# ── Simulator Routes ──────────────────────────────────────────
@router.post("/simulate", response_model=SimulationResult)
async def run_simulation(request: SimulationRequest):
    """Run Monte Carlo investment simulation."""
    result = simulator.run_simulation(
        initial_amount=request.initial_amount,
        monthly_contribution=request.monthly_contribution,
        duration_years=request.duration_years,
        risk_level=request.risk_level,
        num_simulations=request.num_simulations,
    )
    return SimulationResult(**result)


# ── Goal Planner Routes ──────────────────────────────────────
@router.post("/goals/plan", response_model=GoalPlanResponse)
async def plan_goal(request: GoalPlanRequest):
    """Calculate monthly savings needed for a financial goal."""
    result = goal_planner.calculate_goal_plan(
        goal_name=request.goal_name,
        target_amount=request.target_amount,
        current_savings=request.current_savings,
        timeline_years=request.timeline_years,
        risk_tolerance=request.risk_tolerance,
    )
    return GoalPlanResponse(**result)


# ── Loan Eligibility Routes ──────────────────────────────────
@router.post("/loans/eligibility")
async def check_loan_eligibility(
    monthly_salary: float,
    age: int,
    monthly_expenses: float,
    credit_score: int,
    existing_emis: float = 0,
    employment_type: str = "salaried",
):
    """
    Check loan eligibility score.
    Placeholder — will be replaced with Loan Genie logic.
    """
    from app.services.loan_engine import calculate_loan_eligibility
    result = calculate_loan_eligibility(
        monthly_salary=monthly_salary, age=age,
        monthly_expenses=monthly_expenses, credit_score=credit_score,
        existing_emis=existing_emis, employment_type=employment_type,
    )
    return result


# ── Education Routes ──────────────────────────────────────────
@router.get("/education/lessons")
async def get_lessons():
    """Get all available lessons."""
    return {"lessons": education.get_all_lessons(), "modules": education.get_modules()}


@router.get("/education/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    """Get a specific lesson by ID."""
    lesson = education.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


# ── Gamification Routes ───────────────────────────────────────
@router.get("/gamification/badges")
async def get_badges():
    """Get all available badges."""
    return {"badges": gamification.get_all_badges()}


@router.post("/gamification/xp")
async def award_xp(action: str):
    """Award XP for a user action."""
    xp = gamification.get_xp_for_action(action)
    return {"action": action, "xp_awarded": xp}


@router.post("/gamification/level")
async def get_level(total_xp: int):
    """Calculate user level from total XP."""
    return gamification.calculate_level(total_xp)


# ── Budget Tracker Routes ─────────────────────────────────────
@router.post("/budget/analyze")
async def analyze_budget(
    monthly_income: float,
    expenses: list[dict],
):
    """Analyze budget using 50/30/20 rule."""
    total_expenses = sum(e.get("amount", 0) for e in expenses)
    needs = sum(e.get("amount", 0) for e in expenses if e.get("category") == "needs")
    wants = sum(e.get("amount", 0) for e in expenses if e.get("category") == "wants")
    savings = monthly_income - total_expenses

    ideal_needs = monthly_income * 0.5
    ideal_wants = monthly_income * 0.3
    ideal_savings = monthly_income * 0.2

    return {
        "income": monthly_income,
        "total_expenses": total_expenses,
        "savings": savings,
        "savings_rate": round((savings / monthly_income) * 100, 1) if monthly_income > 0 else 0,
        "breakdown": {"needs": needs, "wants": wants, "savings": savings},
        "ideal": {"needs": ideal_needs, "wants": ideal_wants, "savings": ideal_savings},
        "health": "Good" if savings >= ideal_savings else "Needs Improvement",
    }
