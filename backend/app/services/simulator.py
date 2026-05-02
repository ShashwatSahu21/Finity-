"""
Monte Carlo Investment Simulator
Probabilistic investment outcome modeling.
"""
import numpy as np
from typing import Literal


# Historical return parameters by risk level (annualized)
RISK_PARAMS = {
    "conservative": {
        "mean_return": 0.07,    # 7% annual
        "std_dev": 0.06,        # 6% volatility
        "label": "Conservative (Bonds/FD heavy)",
    },
    "moderate": {
        "mean_return": 0.11,    # 11% annual
        "std_dev": 0.14,        # 14% volatility
        "label": "Moderate (Balanced)",
    },
    "aggressive": {
        "mean_return": 0.15,    # 15% annual
        "std_dev": 0.22,        # 22% volatility
        "label": "Aggressive (Equity heavy)",
    },
}


def run_simulation(
    initial_amount: float,
    monthly_contribution: float,
    duration_years: int,
    risk_level: Literal["conservative", "moderate", "aggressive"],
    num_simulations: int = 1000,
) -> dict:
    """
    Run Monte Carlo simulation for investment outcomes.

    Uses geometric Brownian motion to model portfolio value over time.

    Args:
        initial_amount: Starting investment amount
        monthly_contribution: Monthly SIP/contribution amount
        duration_years: Investment horizon in years
        risk_level: Risk tolerance level
        num_simulations: Number of Monte Carlo paths

    Returns:
        Dictionary with simulation results including best/worst/expected cases
    """
    params = RISK_PARAMS[risk_level]
    monthly_mean = params["mean_return"] / 12
    monthly_std = params["std_dev"] / np.sqrt(12)
    total_months = duration_years * 12

    # Generate random monthly returns for all simulations
    np.random.seed(None)  # Ensure randomness
    monthly_returns = np.random.normal(
        monthly_mean, monthly_std, (num_simulations, total_months)
    )

    # Simulate portfolio values
    portfolio_values = np.zeros((num_simulations, total_months + 1))
    portfolio_values[:, 0] = initial_amount

    for month in range(total_months):
        portfolio_values[:, month + 1] = (
            portfolio_values[:, month] * (1 + monthly_returns[:, month])
            + monthly_contribution
        )

    # Extract final values
    final_values = portfolio_values[:, -1]

    # Calculate statistics
    best_case = float(np.percentile(final_values, 95))
    worst_case = float(np.percentile(final_values, 5))
    expected = float(np.mean(final_values))
    median = float(np.median(final_values))
    p25 = float(np.percentile(final_values, 25))
    p75 = float(np.percentile(final_values, 75))

    total_invested = initial_amount + (monthly_contribution * total_months)
    probability_of_loss = float(np.mean(final_values < total_invested))

    # Annualized return (based on expected)
    if initial_amount > 0:
        annualized_return = (expected / initial_amount) ** (1 / duration_years) - 1
    else:
        annualized_return = 0.0

    # Generate monthly data for charting (using percentile paths)
    monthly_data = []
    step = max(1, total_months // 60)  # Limit to ~60 data points for charts

    for month in range(0, total_months + 1, step):
        values_at_month = portfolio_values[:, month]
        monthly_data.append({
            "month": month,
            "year": round(month / 12, 1),
            "expected": round(float(np.mean(values_at_month)), 2),
            "best_case": round(float(np.percentile(values_at_month, 95)), 2),
            "worst_case": round(float(np.percentile(values_at_month, 5)), 2),
            "median": round(float(np.median(values_at_month)), 2),
            "p25": round(float(np.percentile(values_at_month, 25)), 2),
            "p75": round(float(np.percentile(values_at_month, 75)), 2),
            "invested": round(initial_amount + (monthly_contribution * month), 2),
        })

    # Ensure the last data point is included
    if monthly_data[-1]["month"] != total_months:
        values_at_end = portfolio_values[:, -1]
        monthly_data.append({
            "month": total_months,
            "year": duration_years,
            "expected": round(float(np.mean(values_at_end)), 2),
            "best_case": round(float(np.percentile(values_at_end, 95)), 2),
            "worst_case": round(float(np.percentile(values_at_end, 5)), 2),
            "median": round(float(np.median(values_at_end)), 2),
            "p25": round(float(np.percentile(values_at_end, 25)), 2),
            "p75": round(float(np.percentile(values_at_end, 75)), 2),
            "invested": round(total_invested, 2),
        })

    return {
        "best_case": round(best_case, 2),
        "worst_case": round(worst_case, 2),
        "expected": round(expected, 2),
        "median": round(median, 2),
        "percentile_25": round(p25, 2),
        "percentile_75": round(p75, 2),
        "monthly_data": monthly_data,
        "probability_of_loss": round(probability_of_loss * 100, 1),
        "annualized_return": round(annualized_return * 100, 2),
    }
