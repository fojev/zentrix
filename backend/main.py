from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from schema import Student, Finance, Disease

from models.student_model import predict_student
from models.finance_model import analyze_finance
from models.disease_model import predict_disease

app = FastAPI()

# 🔥 CORS (Required for React connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Zentrix Backend Running 🚀"}

# 🎓 STUDENT
@app.post("/predict")
def predict_student_endpoint(data: Student, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
    try:
        # Calculate percentage organically
        percentage = (data.marks / data.maxMarks) * 100 if data.maxMarks > 0 else 0
        
        prediction_result = predict_student(percentage, data.attendance, data.studyHours)
        
        student_record = data.dict()
        student_record.update(prediction_result)
        
        return student_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 💰 FINANCE
@app.post("/finance")
def finance(data: Finance, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
    try:
        analysis_result = analyze_finance(data.income, data.expenses)
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🏥 DISEASE
@app.post("/disease")
def disease(data: Disease, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
    try:
        disease_name, dos, donts = predict_disease(data.symptoms)
        result = {
            "disease": disease_name,
            "dos": dos,
            "donts": donts
        }
        return result
    except Exception as e:
        print(f"Disease Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))