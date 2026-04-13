import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def generate_gemini_suggestion(module: str, input_data: dict) -> str:
    """
    Generates intelligent suggestions using Google Gemini REST API.
    """
    if not GEMINI_API_KEY:
        return "Gemini API insight currently unavailable. Please check backend configuration."

    # Construct the Prompt
    if module == "student":
        prompt = (
            f"Analyze these student stats and the provided ML prediction to give 2 concise improvement tips: "
            f"Marks: {input_data.get('marks')}, Attendance: {input_data.get('attendance')}%, "
            f"Study Hours: {input_data.get('studyHours')}h, Subject: {input_data.get('subject')}. "
            f"ML Prediction indicates an Average Score of {input_data.get('avgScore', 'N/A')} and categorizes them as '{input_data.get('category', 'Unknown')}'. "
            f"Based on this data and the ML prediction, provide a personalized and supportive suggestion. Avoid technical jargon."
        )
    elif module == "finance":
        prompt = (
            f"Analyze this budget and the ML financial analysis to provide 2 concise tips on saving and optimization: "
            f"Income: {input_data.get('income')}, Expenses mapping: {input_data.get('expenses')}. "
            f"ML Analysis indicates total expenses of {input_data.get('total_expense', 'N/A')}, savings of {input_data.get('savings', 'N/A')}, "
            f"and a savings rate of {input_data.get('savings_rate', 'N/A')}%. "
            f"Provide practical financial advice focusing on how to improve or maintain this savings rate. Avoid technical jargon."
        )
    elif module == "disease":
        syms = ", ".join(input_data.get("symptoms", []))
        predicted = input_data.get("predicted_disease", "Unknown condition")
        prompt = (
            f"Based on these symptoms ({syms}), the ML model has predicted a possible condition of '{predicted}'. "
            f"Explain this condition simply and provide 2 practical precautions the user can take. "
            f"Disclaimer: State clearly that this is not a medical diagnosis. Keep it concise (2 sentences). Avoid medical jargon."
        )
    else:
        return "Intelligent analysis is being processed..."

    # API Request Body
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 150
        }
    }
    
    headers = {"Content-Type": "application/json"}
    url = f"{ENDPOINT}?key={GEMINI_API_KEY}"

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        print("AI ERROR:", e)
        return "AI service not responding"
