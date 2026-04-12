from pydantic import BaseModel
from typing import List, Dict

class Student(BaseModel):
    name: str
    subject: str
    marks: float
    attendance: float
    studyHours: float  # camelCase as requested

class Finance(BaseModel):
    income: float
    expenses: Dict[str, float]

class Disease(BaseModel):
    symptoms: List[str]  # array as requested