"""
AI Chat Service
LLM-powered financial coaching with multilingual support.
"""
import os
from typing import Optional


SYSTEM_PROMPT = """You are Finity, an AI Financial Companion designed to help students and young earners in India understand personal finance. You are friendly, patient, and explain concepts in simple terms.

IMPORTANT RULES:
1. You are NOT a financial advisor. You are an educational tool.
2. NEVER recommend specific stocks, mutual funds, or financial products by name.
3. ALWAYS include this disclaimer when discussing investments: "This is for educational purposes only, not financial advice."
4. Explain concepts using simple analogies and examples relevant to Indian context (₹, SIP, FD, PPF, etc.)
5. If the user asks about a topic outside finance, gently redirect them.
6. Be encouraging and supportive — many users are beginners.
7. When asked about loans, explain EMI concepts, interest rates, and eligibility factors.
8. Support the user's language preference — respond in the same language they write in.

TOPICS YOU CAN HELP WITH:
- Budgeting and expense tracking
- Savings strategies (emergency fund, goal-based)
- Investment basics (SIP, mutual funds, FDs, PPF, NPS)
- Loan concepts (EMI, interest, eligibility)
- Tax basics (80C, 80D, HRA)
- Insurance fundamentals
- Financial goal planning

USER CONTEXT (if available):
{user_context}
"""


async def get_ai_response(
    message: str,
    conversation_history: list[dict],
    user_context: Optional[dict] = None,
    provider: str = "groq",
) -> dict:
    """
    Get AI response from LLM provider (Groq or OpenAI).
    Falls back to a helpful default if API is unavailable.
    """
    context_str = ""
    if user_context:
        context_str = f"Risk Profile: {user_context.get('risk_category', 'Unknown')}, "
        context_str += f"Risk Score: {user_context.get('risk_score', 'N/A')}"

    system_msg = SYSTEM_PROMPT.format(user_context=context_str or "No profile data yet")

    messages = [{"role": "system", "content": system_msg}]
    # Include last 10 messages for context window management
    for msg in conversation_history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    try:
        if provider == "groq":
            reply = await _call_groq(messages)
        else:
            reply = await _call_openai(messages)
    except Exception as e:
        reply = _get_fallback_response(message)

    suggested = _generate_suggestions(message)
    return {"reply": reply, "suggested_questions": suggested}


async def _call_groq(messages: list[dict]) -> str:
    """Call Groq API for LLM response."""
    from groq import AsyncGroq
    client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", ""))
    response = await client.chat.completions.create(
        model=os.getenv("AI_MODEL", "llama-3.3-70b-versatile"),
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content


async def _call_openai(messages: list[dict]) -> str:
    """Call OpenAI API for LLM response."""
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )
    return response.choices[0].message.content


def _get_fallback_response(message: str) -> str:
    """Provide helpful response when AI service is unavailable."""
    msg = message.lower()
    if any(w in msg for w in ["sip", "invest", "mutual fund"]):
        return ("A SIP (Systematic Investment Plan) lets you invest a fixed amount "
                "regularly in mutual funds. It's great for beginners because it uses "
                "rupee cost averaging. Start with as little as ₹500/month! "
                "\n\n⚠️ This is for educational purposes only, not financial advice.")
    if any(w in msg for w in ["budget", "expense", "save", "saving"]):
        return ("The 50/30/20 rule is a great starting point: 50% for needs, "
                "30% for wants, 20% for savings. Track every expense for a month "
                "to understand your spending patterns.")
    if any(w in msg for w in ["loan", "emi", "borrow"]):
        return ("When taking a loan, focus on: 1) Interest rate (lower is better), "
                "2) Tenure (longer = lower EMI but more total interest), "
                "3) Processing fees. Always compare offers from multiple lenders.")
    if any(w in msg for w in ["tax", "80c", "deduction"]):
        return ("Under Section 80C, you can save up to ₹1.5 lakh in tax by investing "
                "in PPF, ELSS, NPS, or paying life insurance premiums. Section 80D "
                "covers health insurance premiums up to ₹25,000.")
    return ("I'm here to help you understand personal finance! You can ask me about "
            "budgeting, savings, investments, loans, or taxes. What would you like to learn?")


def _generate_suggestions(message: str) -> list[str]:
    """Generate contextual follow-up question suggestions."""
    msg = message.lower()
    if any(w in msg for w in ["sip", "invest"]):
        return [
            "How does rupee cost averaging work?",
            "What's the difference between SIP and lump sum?",
            "How do I choose between equity and debt funds?",
        ]
    if any(w in msg for w in ["budget", "expense"]):
        return [
            "What is the 50/30/20 budgeting rule?",
            "How do I build an emergency fund?",
            "What are some common money mistakes to avoid?",
        ]
    if any(w in msg for w in ["loan", "emi"]):
        return [
            "How is EMI calculated?",
            "Fixed vs floating interest rate — which is better?",
            "How does my credit score affect loan eligibility?",
        ]
    return [
        "How should I start investing as a beginner?",
        "What's a good budgeting strategy for students?",
        "How do I build an emergency fund?",
    ]
