"""
Risk Profiling Service
Questionnaire-based risk assessment engine.
"""

# Risk assessment questions with scoring weights
RISK_QUESTIONS = [
    {
        "id": 1,
        "question": "What is your primary investment goal?",
        "options": [
            {"value": 1, "label": "Preserve my capital – I can't afford to lose money"},
            {"value": 2, "label": "Generate steady income with minimal risk"},
            {"value": 3, "label": "Balanced growth and income"},
            {"value": 4, "label": "Long-term growth – I can handle some volatility"},
            {"value": 5, "label": "Maximum growth – I'm comfortable with high risk"},
        ],
        "weight": 1.5,
        "category": "goals",
    },
    {
        "id": 2,
        "question": "How long do you plan to invest before needing the money?",
        "options": [
            {"value": 1, "label": "Less than 1 year"},
            {"value": 2, "label": "1–3 years"},
            {"value": 3, "label": "3–5 years"},
            {"value": 4, "label": "5–10 years"},
            {"value": 5, "label": "More than 10 years"},
        ],
        "weight": 1.3,
        "category": "horizon",
    },
    {
        "id": 3,
        "question": "If your investments dropped 20% in a month, what would you do?",
        "options": [
            {"value": 1, "label": "Sell everything immediately"},
            {"value": 2, "label": "Sell some to reduce losses"},
            {"value": 3, "label": "Hold and wait for recovery"},
            {"value": 4, "label": "Buy a little more at lower prices"},
            {"value": 5, "label": "Buy significantly more – great opportunity!"},
        ],
        "weight": 2.0,
        "category": "behavior",
    },
    {
        "id": 4,
        "question": "What percentage of your monthly income can you invest?",
        "options": [
            {"value": 1, "label": "Less than 5%"},
            {"value": 2, "label": "5–10%"},
            {"value": 3, "label": "10–20%"},
            {"value": 4, "label": "20–30%"},
            {"value": 5, "label": "More than 30%"},
        ],
        "weight": 1.0,
        "category": "capacity",
    },
    {
        "id": 5,
        "question": "How much investment experience do you have?",
        "options": [
            {"value": 1, "label": "None – I'm a complete beginner"},
            {"value": 2, "label": "Basic – I've used a savings account or FD"},
            {"value": 3, "label": "Intermediate – I've invested in mutual funds"},
            {"value": 4, "label": "Advanced – I actively trade stocks"},
            {"value": 5, "label": "Expert – I use derivatives and complex instruments"},
        ],
        "weight": 1.2,
        "category": "experience",
    },
    {
        "id": 6,
        "question": "How would you describe your current financial situation?",
        "options": [
            {"value": 1, "label": "Living paycheck to paycheck"},
            {"value": 2, "label": "Stable but with limited savings"},
            {"value": 3, "label": "Comfortable with an emergency fund"},
            {"value": 4, "label": "Well-off with diversified savings"},
            {"value": 5, "label": "Wealthy with multiple income sources"},
        ],
        "weight": 1.4,
        "category": "stability",
    },
    {
        "id": 7,
        "question": "How do you feel about the statement: 'Higher risk = higher potential returns'?",
        "options": [
            {"value": 1, "label": "Strongly disagree – safety first"},
            {"value": 2, "label": "Somewhat disagree"},
            {"value": 3, "label": "Neutral – depends on the situation"},
            {"value": 4, "label": "Somewhat agree"},
            {"value": 5, "label": "Strongly agree – I embrace risk for returns"},
        ],
        "weight": 1.6,
        "category": "attitude",
    },
    {
        "id": 8,
        "question": "What type of investments are you most comfortable with?",
        "options": [
            {"value": 1, "label": "Fixed deposits and savings accounts"},
            {"value": 2, "label": "Government bonds and debt funds"},
            {"value": 3, "label": "Balanced/hybrid mutual funds"},
            {"value": 4, "label": "Equity mutual funds and ETFs"},
            {"value": 5, "label": "Individual stocks and crypto"},
        ],
        "weight": 1.3,
        "category": "preference",
    },
]


def calculate_risk_score(answers: list[dict]) -> dict:
    """
    Calculate a risk score from 0–100 based on questionnaire answers.

    Returns:
        dict with risk_score, risk_category, breakdown, and recommendations.
    """
    question_map = {q["id"]: q for q in RISK_QUESTIONS}
    total_weighted_score = 0
    max_possible_score = 0
    category_scores = {}

    for answer in answers:
        q_id = answer["question_id"]
        value = answer["answer_value"]

        if q_id not in question_map:
            continue

        question = question_map[q_id]
        weight = question["weight"]
        category = question["category"]

        weighted_score = value * weight
        total_weighted_score += weighted_score
        max_possible_score += 5 * weight  # max value is 5

        if category not in category_scores:
            category_scores[category] = {"score": 0, "max": 0}
        category_scores[category]["score"] += weighted_score
        category_scores[category]["max"] += 5 * weight

    # Normalize to 0–100
    risk_score = int((total_weighted_score / max_possible_score) * 100) if max_possible_score > 0 else 50

    # Determine category
    if risk_score <= 33:
        risk_category = "Conservative"
    elif risk_score <= 66:
        risk_category = "Moderate"
    else:
        risk_category = "Aggressive"

    # Calculate breakdown percentages
    breakdown = {}
    for cat, data in category_scores.items():
        breakdown[cat] = round((data["score"] / data["max"]) * 100, 1) if data["max"] > 0 else 0

    # Generate recommendations
    recommendations = _get_recommendations(risk_category, breakdown)

    return {
        "risk_score": risk_score,
        "risk_category": risk_category,
        "breakdown": breakdown,
        "recommendations": recommendations,
    }


def _get_recommendations(category: str, breakdown: dict) -> list[str]:
    """Generate personalized investment recommendations based on risk profile."""
    recs = []

    if category == "Conservative":
        recs = [
            "Consider fixed deposits and government bonds for stable returns",
            "Allocate 70-80% to debt instruments and 20-30% to equity",
            "Look into systematic investment plans (SIPs) for gradual market exposure",
            "Build an emergency fund covering 6-12 months of expenses first",
            "Consider liquid funds for short-term parking of money",
        ]
    elif category == "Moderate":
        recs = [
            "A balanced portfolio with 50-60% equity and 40-50% debt could work well",
            "Diversify across large-cap, mid-cap mutual funds and bonds",
            "Consider index funds for low-cost, broad market exposure",
            "Rebalance your portfolio every 6-12 months",
            "Start SIPs to benefit from rupee cost averaging",
        ]
    else:  # Aggressive
        recs = [
            "You can allocate 70-80% to equity and 20-30% to debt",
            "Consider small-cap and mid-cap funds for higher growth potential",
            "Explore international diversification through global funds",
            "Keep a portion in emerging sectors like technology or green energy",
            "Ensure you still maintain a basic emergency fund despite high risk tolerance",
        ]

    # Add contextual tips based on breakdown
    if breakdown.get("experience", 100) < 40:
        recs.append("Since you're newer to investing, start with mutual funds before individual stocks")
    if breakdown.get("horizon", 100) < 40:
        recs.append("With a shorter time horizon, consider more liquid investments")

    return recs[:6]


def get_questions() -> list[dict]:
    """Return all risk assessment questions."""
    return RISK_QUESTIONS
