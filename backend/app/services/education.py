"""
Education Module Service
Financial literacy lessons with progress tracking.
"""

LESSONS = [
    {
        "id": "basics-1",
        "module": "Basics",
        "title": "What is Money?",
        "order": 1,
        "duration_min": 5,
        "xp_reward": 50,
        "content": "Money is a medium of exchange that allows people to trade goods and services. In India, our currency is the Indian Rupee (₹), managed by the Reserve Bank of India (RBI).\n\n**Key Concepts:**\n- **Inflation**: Prices increase over time, reducing purchasing power\n- **Interest**: The cost of borrowing or the reward for saving\n- **Compound Interest**: Interest earned on interest — Einstein called it the 8th wonder of the world!\n\n**Example:** If you invest ₹10,000 at 8% annual interest:\n- After 1 year: ₹10,800\n- After 10 years: ₹21,589\n- After 30 years: ₹1,00,627",
        "quiz": [
            {"question": "What is inflation?", "options": ["Prices going up", "Prices going down", "Money supply increasing", "GDP growth"], "correct": 0},
            {"question": "Who manages the Indian Rupee?", "options": ["SEBI", "RBI", "Finance Ministry", "SBI"], "correct": 1},
        ],
    },
    {
        "id": "basics-2",
        "module": "Basics",
        "title": "Budgeting 101",
        "order": 2,
        "duration_min": 8,
        "xp_reward": 50,
        "content": "A budget is a plan for your money. The most popular method is the **50/30/20 rule**:\n\n- **50% Needs**: Rent, food, transport, utilities\n- **30% Wants**: Entertainment, dining out, shopping\n- **20% Savings**: Emergency fund, investments, goals\n\n**Steps to Budget:**\n1. Track all income sources\n2. List all expenses for a month\n3. Categorize into Needs/Wants/Savings\n4. Cut unnecessary wants\n5. Automate savings (SIP, recurring deposits)\n\n**Pro Tip:** Use the 24-hour rule — wait a day before making any unplanned purchase over ₹1,000.",
        "quiz": [
            {"question": "In the 50/30/20 rule, what percentage goes to savings?", "options": ["50%", "30%", "20%", "10%"], "correct": 2},
            {"question": "What is the 24-hour rule?", "options": ["Save for 24 hours", "Wait before unplanned purchases", "Invest daily", "Track hourly expenses"], "correct": 1},
        ],
    },
    {
        "id": "savings-1",
        "module": "Savings",
        "title": "Emergency Fund",
        "order": 3,
        "duration_min": 6,
        "xp_reward": 50,
        "content": "An emergency fund is money set aside for unexpected expenses — job loss, medical emergencies, or urgent repairs.\n\n**How Much?** 3-6 months of monthly expenses\n\n**Where to Keep It:**\n- Savings account (instant access)\n- Liquid mutual funds (slightly better returns)\n- Fixed deposits (if you can lock for short term)\n\n**Building Your Emergency Fund:**\n1. Start with a target of 1 month's expenses\n2. Save a fixed amount each month\n3. Keep it separate from regular savings\n4. Only use for TRUE emergencies\n\n**Example:** Monthly expenses = ₹30,000 → Emergency fund target = ₹90,000-₹1,80,000",
        "quiz": [
            {"question": "How many months of expenses should your emergency fund cover?", "options": ["1 month", "3-6 months", "12 months", "24 months"], "correct": 1},
        ],
    },
    {
        "id": "investing-1",
        "module": "Investing",
        "title": "What is a SIP?",
        "order": 4,
        "duration_min": 7,
        "xp_reward": 50,
        "content": "A **Systematic Investment Plan (SIP)** lets you invest a fixed amount regularly (usually monthly) in mutual funds.\n\n**Benefits of SIP:**\n- **Rupee Cost Averaging**: Buy more units when prices are low, fewer when high\n- **Discipline**: Automated investing removes emotional decisions\n- **Flexibility**: Start with as little as ₹500/month\n- **Power of Compounding**: Small amounts grow significantly over time\n\n**Example:** ₹5,000/month SIP for 20 years at 12% returns → ₹49.9 lakhs (invested only ₹12 lakhs)\n\n⚠️ *This is for educational purposes only, not financial advice.*",
        "quiz": [
            {"question": "What does SIP stand for?", "options": ["Simple Investment Plan", "Systematic Investment Plan", "Standard Interest Payment", "Savings Interest Program"], "correct": 1},
            {"question": "What is the minimum SIP amount typically?", "options": ["₹100", "₹500", "₹1,000", "₹5,000"], "correct": 1},
        ],
    },
    {
        "id": "investing-2",
        "module": "Investing",
        "title": "Risk and Returns",
        "order": 5,
        "duration_min": 8,
        "xp_reward": 50,
        "content": "In investing, risk and return are directly related — higher potential returns usually mean higher risk.\n\n**Risk Spectrum (Low to High):**\n1. 🟢 Fixed Deposits: ~6-7% returns, very safe\n2. 🟢 Government Bonds: ~7-8%, safe\n3. 🟡 Debt Mutual Funds: ~7-9%, moderate\n4. 🟡 Balanced Funds: ~10-12%, moderate\n5. 🔴 Equity Funds: ~12-15%, higher risk\n6. 🔴 Individual Stocks: Variable, high risk\n\n**Key Principle:** Never invest money you can't afford to lose in high-risk instruments.\n\n**Diversification:** Don't put all eggs in one basket. Spread across asset classes.\n\n⚠️ *This is for educational purposes only, not financial advice.*",
        "quiz": [
            {"question": "Which has the highest risk?", "options": ["FD", "Government bonds", "Individual stocks", "Debt funds"], "correct": 2},
        ],
    },
    {
        "id": "loans-1",
        "module": "Loans",
        "title": "Understanding EMI",
        "order": 6,
        "duration_min": 6,
        "xp_reward": 50,
        "content": "**EMI (Equated Monthly Installment)** is the fixed amount you pay monthly to repay a loan.\n\n**EMI depends on:**\n- **Principal**: The loan amount\n- **Interest Rate**: Annual rate charged\n- **Tenure**: Loan duration in months\n\n**Formula:** EMI = P × r × (1+r)^n / ((1+r)^n - 1)\n\nWhere P = principal, r = monthly interest rate, n = tenure in months\n\n**Example:** ₹10 lakh home loan at 8.5% for 20 years → EMI = ₹8,678\n\n**Tips:**\n- Shorter tenure = more EMI but less total interest\n- Compare interest rates across banks\n- Check for prepayment penalties\n- Keep total EMIs under 40% of income",
        "quiz": [
            {"question": "What does EMI stand for?", "options": ["Equal Money Installment", "Equated Monthly Installment", "Extra Monthly Interest", "Estimated Monthly Income"], "correct": 1},
        ],
    },
    {
        "id": "tax-1",
        "module": "Tax",
        "title": "Tax Saving Basics",
        "order": 7,
        "duration_min": 8,
        "xp_reward": 50,
        "content": "Understanding income tax helps you keep more of what you earn.\n\n**Key Tax-Saving Sections:**\n\n**Section 80C (up to ₹1.5 lakh):**\n- PPF, ELSS mutual funds, EPF\n- Life insurance premiums, NSC\n- Home loan principal, children's tuition\n\n**Section 80D (Health Insurance):**\n- Self/family: up to ₹25,000\n- Parents (senior): up to ₹50,000\n\n**HRA Exemption:** If you pay rent and receive HRA\n\n**New vs Old Tax Regime:**\n- Old regime: Higher rates but more deductions\n- New regime: Lower rates, fewer deductions\n- Calculate which works better for your situation",
        "quiz": [
            {"question": "What is the 80C deduction limit?", "options": ["₹1 lakh", "₹1.5 lakh", "₹2 lakh", "₹2.5 lakh"], "correct": 1},
        ],
    },
]


def get_all_lessons() -> list[dict]:
    """Return all available lessons (without full content for listing)."""
    return [
        {
            "id": l["id"], "module": l["module"], "title": l["title"],
            "order": l["order"], "duration_min": l["duration_min"],
            "xp_reward": l["xp_reward"],
        }
        for l in LESSONS
    ]


def get_lesson_by_id(lesson_id: str) -> dict | None:
    """Return a full lesson by ID."""
    for l in LESSONS:
        if l["id"] == lesson_id:
            return l
    return None


def get_modules() -> list[str]:
    """Return list of unique module names."""
    return list(dict.fromkeys(l["module"] for l in LESSONS))
