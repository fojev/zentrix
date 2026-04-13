from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import json
import database

from schema import Student, Finance, Disease
from ai_service import get_student_suggestion, get_finance_suggestion, get_disease_suggestion

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

def maintain_record_limit(user_id: str, table_name: str, limit: int = 5):
    """Keep only the latest `limit` records per user in `table_name`."""
    try:
        database.cursor.execute(f"""
            DELETE FROM {table_name} 
            WHERE id NOT IN (
                SELECT id FROM {table_name} 
                WHERE user_id = ? 
                ORDER BY id DESC LIMIT ?
            ) AND user_id = ?
        """, (user_id, limit, user_id))
        database.conn.commit()
    except Exception as e:
        print(f"Error maintaining limits: {e}")

@app.get("/")
def home():
    return {"message": "Zentrix Backend Running 🚀"}

# 🎓 STUDENT
@app.post("/add-student")
def add_student(data: Student, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
        
    try:
        prediction_result = predict_student(data.marks, data.attendance, data.studyHours)
        
        # AI Suggestion
        cat = prediction_result.get("category", "Unknown")
        ai_suggestion = get_student_suggestion(data.marks, data.attendance, data.studyHours, cat)
        
        # Save to DB
        database.cursor.execute("""
            INSERT INTO students (user_id, name, subject, marks, attendance, study_hours, prediction, category, ai_suggestion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (x_user_id, data.name, data.subject, data.marks, data.attendance, data.studyHours, 
              prediction_result.get("avgScore"), cat, ai_suggestion))
        database.conn.commit()
        inserted_id = database.cursor.lastrowid
        
        maintain_record_limit(x_user_id, "students", 5)
        
        student_record = data.dict()
        student_record.update(prediction_result)
        student_record["id"] = inserted_id
        student_record["ai_suggestion"] = ai_suggestion
        return student_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students")
def get_students(x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
        
    try:
        database.cursor.execute("""
            SELECT id, name, subject, marks, attendance, study_hours, prediction, category, ai_suggestion
            FROM students WHERE user_id = ? ORDER BY id ASC
        """, (x_user_id,))
        rows = database.cursor.fetchall()
        
        results = []
        for row in rows:
            record = {
                "id": row[0],
                "name": row[1],
                "subject": row[2],
                "marks": row[3],
                "attendance": row[4],
                "studyHours": row[5],
                "avgScore": row[6],
                "lrScore": row[6],  # Approximate/mock for simple parity
                "rfScore": row[6],  # Approximate/mock for simple parity
                "category": row[7],
                "ai_suggestion": row[8],
                "suggestions": [] # For legacy compatibility with UI expecting array
            }
            results.append(record)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 💰 FINANCE
@app.post("/finance")
def finance(data: Finance, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
        
    try:
        analysis_result = analyze_finance(data.income, data.expenses)
        
        savings = analysis_result["savings"]
        rate = analysis_result["savings_rate"]
        
        # AI Suggestion
        ai_suggestion = get_finance_suggestion(data.income, analysis_result["total_expense"], savings, rate)
        
        # Insert
        database.cursor.execute("""
            INSERT INTO finance (user_id, income, total_expense, savings, savings_rate, suggestion, ai_suggestion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (x_user_id, data.income, analysis_result["total_expense"], savings, rate, json.dumps(analysis_result.get("suggestions", [])), ai_suggestion))
        database.conn.commit()
        
        maintain_record_limit(x_user_id, "finance", 5)
        
        analysis_result["ai_suggestion"] = ai_suggestion
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/finance/history")
def get_finance_history(x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
        
    try:
        database.cursor.execute("""
            SELECT id, income, total_expense, savings, ai_suggestion
            FROM finance WHERE user_id = ? ORDER BY id ASC
        """, (x_user_id,))
        rows = database.cursor.fetchall()
        
        results = []
        # Generate generic months based on the number of historic items to simulate a trend line easily
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        current_month_index = len(rows)
        
        for i, row in enumerate(rows):
            month_label = months[i % 12]
            record = {
                "id": row[0],
                "month": month_label,
                "Income": row[1],
                "Expenses": row[2],
                "Savings": row[3],
                "ai_suggestion": row[4]
            }
            results.append(record)
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🏥 DISEASE
@app.post("/disease")
def disease(data: Disease, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
        
    try:
        disease_name, dos, donts = predict_disease(data.symptoms)
        
        # AI Suggestion
        ai_suggestion = get_disease_suggestion(data.symptoms, disease_name, dos, donts)
        
        # Insert
        database.cursor.execute("""
            INSERT INTO disease (user_id, symptoms, prediction, dos, donts, ai_suggestion)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (x_user_id, json.dumps(data.symptoms), disease_name, json.dumps(dos), json.dumps(donts), ai_suggestion))
        database.conn.commit()
        
        maintain_record_limit(x_user_id, "disease", 5)
        
        result = {
            "disease": disease_name,
            "dos": dos,
            "donts": donts,
            "ai_suggestion": ai_suggestion
        }
        return result
    except Exception as e:
        print(f"Disease Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))