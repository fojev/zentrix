from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from schema import Student, Finance, Disease
import database

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
@app.post("/add-student")
def add_student(data: Student):
    try:
        prediction_result = predict_student(data.marks, data.attendance, data.studyHours)
        student_record = data.dict()
        student_record.update(prediction_result)
        
        # Assign unique ID
        student_record["id"] = database.student_id_counter
        database.student_id_counter += 1
        
        database.students_db.append(student_record)
        return student_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students")
def get_students():
    return database.students_db

@app.put("/student/{student_id}")
def update_student(student_id: int, data: Student):
    try:
        for i, s in enumerate(database.students_db):
            if s.get("id") == student_id:
                prediction_result = predict_student(data.marks, data.attendance, data.studyHours)
                updated_record = data.dict()
                updated_record.update(prediction_result)
                updated_record["id"] = student_id
                database.students_db[i] = updated_record
                return updated_record
        raise HTTPException(status_code=404, detail="Student not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/student/{student_id}")
def delete_student(student_id: int):
    try:
        for i, s in enumerate(database.students_db):
            if s.get("id") == student_id:
                database.students_db.pop(i)
                return {"message": "Student deleted successfully"}
        raise HTTPException(status_code=404, detail="Student not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 💰 FINANCE
@app.post("/finance")
def finance(data: Finance):
    try:
        analysis_result = analyze_finance(data.income, data.expenses)
        finance_db.append(analysis_result)
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🏥 DISEASE
@app.post("/disease")
def disease(data: Disease):
    try:
        disease_name, dos, donts = predict_disease(data.symptoms)
        result = {
            "disease": disease_name,
            "dos": dos,
            "donts": donts
        }
        disease_db.append(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))