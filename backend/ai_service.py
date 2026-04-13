import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Use gemini-1.5-flash for fastest response typical in APIs
MODEL_NAME = "gemini-1.5-flash"

def get_student_suggestion(marks: float, attendance: float, study_hours: float, category: str) -> str:
    if not GEMINI_API_KEY:
        return _fallback_student_suggestion(marks, attendance, study_hours, category)
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = (
            f"You are an AI academic advisor. "
            f"A student has the following metrics: "
            f"Marks: {marks}, Attendance: {attendance}%, Study Hours: {study_hours}h. "
            f"The ML model predicts their category as '{category}'. "
            f"Provide a brief, encouraging, and actionable 2-sentence suggestion to help them improve or maintain their performance. "
            f"Do not use markdown, keep it as plain text."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error (Student): {e}")
        return _fallback_student_suggestion(marks, attendance, study_hours, category)

def get_finance_suggestion(income: float, total_expense: float, savings: float, savings_rate: float) -> str:
    if not GEMINI_API_KEY:
        return _fallback_finance_suggestion(income, total_expense, savings, savings_rate)
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = (
            f"You are an AI financial advisor. "
            f"A user has a monthly income of ${income}, total expenses of ${total_expense}, "
            f"resulting in savings of ${savings} ({savings_rate:.1f}% savings rate). "
            f"Provide a brief, practical 2-sentence financial advice tailored to this user. "
            f"Keep it as plain text without markdown."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error (Finance): {e}")
        return _fallback_finance_suggestion(income, total_expense, savings, savings_rate)

def get_disease_suggestion(symptoms: list[str], disease: str, dos: list[str], donts: list[str]) -> str:
    if not GEMINI_API_KEY:
        return _fallback_disease_suggestion(symptoms, disease)
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = (
            f"You are an AI health assistant. "
            f"A user is experiencing the following symptoms: {', '.join(symptoms)}. "
            f"An ML model predicts the condition might be '{disease}'. "
            f"They have been advised to DO: {', '.join(dos)} and DON'T: {', '.join(donts)}. "
            f"Provide a brief, comforting, but cautious 2-sentence general health insight. "
            f"Do not diagnose formally. Keep it as plain text without markdown."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error (Disease): {e}")
        return _fallback_disease_suggestion(symptoms, disease)

# --- Rule-Based Fallbacks ---

def _fallback_student_suggestion(marks: float, attendance: float, study_hours: float, category: str) -> str:
    if attendance < 75:
        adv = "Improving your attendance is critical to better performance."
    elif study_hours < 3:
        adv = "Increasing your study hours will directly boost your projected score."
    else:
        adv = "Keep maintaining your current positive habits."
    return f"Based on your metrics, the ML model categorizes you as '{category}'. {adv}"

def _fallback_finance_suggestion(income, total_expense, savings, savings_rate):
    if savings < 0:
        adv = "You are currently running a deficit. Immediate expense reduction is recommended."
    elif savings_rate < 20:
        adv = "Try following the 50/30/20 rule to safely increase your savings rate."
    else:
        adv = "You have a healthy savings rate. Consider investing your surplus into index funds."
    return f"Based on your Income (${income}) and Expenses (${total_expense}), your projected savings are ${savings}. {adv}"

def _fallback_disease_suggestion(symptoms, disease):
    return f"Based on your selected symptoms, the ML classification model predicts a possible condition of '{disease}'. Please ensure you follow the recommended precautions and seek professional medical advice if symptoms persist."
