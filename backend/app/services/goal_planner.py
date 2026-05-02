"""
Goal Planner Service
Calculates monthly savings needed to reach financial goals.
"""
from typing import Literal

EXPECTED_RETURNS = {"conservative": 0.07, "moderate": 0.11, "aggressive": 0.15}


def calculate_goal_plan(
    goal_name: str, target_amount: float, current_savings: float,
    timeline_years: int, risk_tolerance: Literal["conservative", "moderate", "aggressive"],
) -> dict:
    annual_return = EXPECTED_RETURNS[risk_tolerance]
    monthly_return = annual_return / 12
    total_months = timeline_years * 12
    fv_savings = current_savings * (1 + monthly_return) ** total_months
    remaining = max(0, target_amount - fv_savings)

    if monthly_return > 0 and remaining > 0:
        monthly_savings = remaining * monthly_return / ((1 + monthly_return) ** total_months - 1)
    else:
        monthly_savings = remaining / total_months if total_months > 0 else remaining

    total_contributions = monthly_savings * total_months + current_savings
    expected_returns = target_amount - total_contributions
    savings_ratio = monthly_savings / 50000

    if fv_savings >= target_amount:
        feasibility, monthly_savings = "Easy", 0
    elif savings_ratio < 0.1:
        feasibility = "Easy"
    elif savings_ratio < 0.25:
        feasibility = "Moderate"
    elif savings_ratio < 0.5:
        feasibility = "Challenging"
    else:
        feasibility = "Very Challenging"

    tips = [
        "Set up automatic SIPs to invest regularly without fail",
        "Review and adjust your plan every 6 months",
        "Consistency is the key to reaching any financial goal",
    ]
    if feasibility in ["Challenging", "Very Challenging"]:
        tips.insert(0, f"Consider extending your timeline beyond {timeline_years} years")
    if timeline_years > 5:
        tips.append("With a longer horizon, equity-heavy investments tend to outperform")

    return {
        "goal_name": goal_name, "target_amount": round(target_amount, 2),
        "monthly_savings_required": round(monthly_savings, 2),
        "total_contributions": round(total_contributions, 2),
        "expected_returns": round(max(0, expected_returns), 2),
        "projected_final_amount": round(target_amount, 2),
        "feasibility": feasibility, "tips": tips[:5],
    }
