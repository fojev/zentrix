from pydantic import BaseModel, Field
from typing import List, Dict

class Student(BaseModel):
    name: str = Field(..., example="Alice Smith")
    subject: str = Field(..., example="Mathematics")
    marks: float = Field(..., example=85.5)
    attendance: float = Field(..., example=92.0)
    studyHours: float = Field(..., example=4.5)

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Alice Smith",
                "subject": "Mathematics",
                "marks": 85.5,
                "attendance": 92.0,
                "studyHours": 4.5
            }
        }
    }

class Finance(BaseModel):
    income: float = Field(..., example=5000.0)
    expenses: Dict[str, float] = Field(..., example={"Housing": 1200.0, "Food": 400.0})

    model_config = {
        "json_schema_extra": {
            "example": {
                "income": 5000.0,
                "expenses": {"Housing": 1200.0, "Food": 400.0, "Utilities": 150.0}
            }
        }
    }

class Disease(BaseModel):
    symptoms: List[str] = Field(..., example=["Fever", "Cough", "Fatigue"])

    model_config = {
        "json_schema_extra": {
            "example": {
                "symptoms": ["Fever", "Cough", "Fatigue"]
            }
        }
    }