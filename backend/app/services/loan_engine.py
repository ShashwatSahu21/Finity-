"""
Loan Eligibility Service — Powered by Loan Genie ML Model
Integrates the trained Random Forest model from the Loan-Genie project.
Falls back to rule-based scoring if model files aren't available.
"""
import os
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "..", "..", "..", "Loan-Genie-main", "Loan-Genie-main", "Loan Prediction model")


def predict_with_ml_model(
    age: int, experience: int, income: float, family_size: int,
    ccavg: float, education: int, mortgage: float,
    securities_account: int, cd_account: int, online: int, credit_card: int,
) -> dict | None:
    """
    Use Loan Genie's trained RandomForest model for prediction.
    Returns None if model files aren't available.
    """
    try:
        import joblib
        import pickle

        model_path = os.path.join(MODEL_DIR, "loan_prediction_model.joblib")
        scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            return None

        model = joblib.load(model_path)
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)

        input_data = np.array([[
            age, experience, income, family_size, ccavg,
            education, mortgage, securities_account, cd_account, online, credit_card,
        ]])
        scaled_input = scaler.transform(input_data)
        probability = float(model.predict_proba(scaled_input)[0][1])

        if probability > 0.7:
            eligibility = "High"
            message = "Strong candidate for loan approval based on your profile."
        elif probability > 0.5:
            eligibility = "Moderate"
            message = "Moderate chances of approval. Consider strengthening weak areas."
        else:
            eligibility = "Low"
            message = "Approval may be difficult. See tips below to improve eligibility."

        return {
            "probability": round(probability * 100, 1),
            "eligible": probability > 0.5,
            "eligibility": eligibility,
            "confidence": "high" if abs(probability - 0.5) > 0.2 else "moderate",
            "message": message,
            "model": "ml_random_forest",
        }
    except Exception as e:
        print(f"ML model prediction failed: {e}")
        return None


def calculate_loan_eligibility(
    monthly_salary: float = 0, age: int = 30, monthly_expenses: float = 0,
    credit_score: int = 700, existing_emis: float = 0,
    employment_type: str = "salaried",
    # Loan Genie fields (optional)
    experience: int = 0, income: float = 0, family_size: int = 1,
    ccavg: float = 0, education: int = 1, mortgage: float = 0,
    securities_account: int = 0, cd_account: int = 0,
    online: int = 1, credit_card: int = 0,
) -> dict:
    """
    Calculate loan eligibility.
    Tries ML model first (Loan Genie), falls back to rule-based scoring.
    """
    # Try ML model first if Loan Genie fields are provided
    if income > 0:
        ml_result = predict_with_ml_model(
            age, experience, income, family_size, ccavg,
            education, mortgage, securities_account, cd_account, online, credit_card,
        )
        if ml_result:
            tips = _generate_tips(ml_result["probability"], credit_score, age)
            ml_result["tips"] = tips
            return ml_result

    # Fallback: rule-based scoring
    score = 0
    factors = {}

    # Credit Score (30 pts)
    cs = 30 if credit_score >= 750 else 24 if credit_score >= 700 else 18 if credit_score >= 650 else 12 if credit_score >= 600 else 5
    score += cs
    factors["credit_score"] = {"score": cs, "max": 30}

    # DTI (25 pts)
    salary = monthly_salary or (income * 1000 / 12)
    dti = (monthly_expenses + existing_emis) / salary if salary > 0 else 1
    dti_s = 25 if dti < 0.3 else 20 if dti < 0.4 else 15 if dti < 0.5 else 10 if dti < 0.6 else 5
    score += dti_s
    factors["debt_to_income"] = {"score": dti_s, "max": 25, "ratio": round(dti * 100, 1)}

    # Age (15 pts)
    age_s = 15 if 25 <= age <= 45 else 12 if 21 <= age <= 55 else 8 if 18 <= age <= 60 else 4
    score += age_s
    factors["age"] = {"score": age_s, "max": 15}

    # Employment (15 pts)
    emp_s = {"salaried": 15, "self_employed": 12, "freelancer": 9, "student": 5, "unemployed": 2}.get(employment_type, 9)
    score += emp_s
    factors["employment"] = {"score": emp_s, "max": 15}

    # Disposable (15 pts)
    disposable = salary - monthly_expenses - existing_emis
    dr = disposable / salary if salary > 0 else 0
    d_s = 15 if dr > 0.4 else 12 if dr > 0.3 else 9 if dr > 0.2 else 6 if dr > 0.1 else 3
    score += d_s
    factors["disposable_income"] = {"score": d_s, "max": 15, "amount": round(disposable, 2)}

    max_emi = max(0, disposable * 0.4)
    if max_emi > 0:
        r = 0.10 / 12
        n = 60
        max_loan = max_emi * ((1 + r) ** n - 1) / (r * (1 + r) ** n)
    else:
        max_loan = 0

    eligibility = "High" if score >= 75 else "Moderate" if score >= 55 else "Low" if score >= 35 else "Very Low"
    message = {
        "High": "Strong financial profile. Likely to get approved with competitive rates.",
        "Moderate": "Decent profile. May qualify but might not get the best rates.",
        "Low": "Limited eligibility. Consider improving credit and reducing debts.",
        "Very Low": "Approval may be difficult. Focus on building credit history.",
    }[eligibility]

    return {
        "probability": score,
        "eligible": score >= 55,
        "eligibility": eligibility,
        "confidence": "high" if score >= 75 else "moderate" if score >= 55 else "low",
        "message": message,
        "model": "rule_based",
        "max_loan_amount": round(max_loan, 2),
        "max_emi_affordable": round(max_emi, 2),
        "factors": factors,
        "tips": _generate_tips(score, credit_score, age),
    }


def _generate_tips(score: float, credit_score: int, age: int) -> list[str]:
    tips = []
    if credit_score < 700:
        tips.append("Improve your credit score by paying bills on time and reducing credit utilization")
    if score < 50:
        tips.append("Consider a smaller loan amount or longer tenure to improve chances")
    tips.append("Compare offers from multiple lenders before committing")
    tips.append("⚠️ This is an educational estimate, not a guarantee of loan approval")
    return tips
