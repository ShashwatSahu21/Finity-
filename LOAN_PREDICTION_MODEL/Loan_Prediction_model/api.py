from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loan_predictor import predict_loan_approval
import os

app = FastAPI()

# Get allowed origins from environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

# Enable CORS with restricted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

class LoanPredictionRequest(BaseModel):
    age: int
    experience: int
    income: float
    family_size: int
    ccavg: float
    education: int
    mortgage: float
    securities_account: int
    cd_account: int
    online: int
    credit_card: int

@app.post("/predict")
async def predict_loan(request: LoanPredictionRequest):
    try:
        probability = predict_loan_approval(
            age=request.age,
            experience=request.experience,
            income=request.income,
            family_size=request.family_size,
            ccavg=request.ccavg,
            education=request.education,
            mortgage=request.mortgage,
            securities_account=request.securities_account,
            cd_account=request.cd_account,
            online=request.online,
            credit_card=request.credit_card
        )
        
        if probability is None:
            raise HTTPException(status_code=500, detail="Prediction failed")
            
        return {
            "probability": probability,
            "eligible": probability > 0.5,
            "confidence": "high" if abs(probability - 0.5) > 0.2 else "moderate"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 