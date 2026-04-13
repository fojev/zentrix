import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_ai_suggestion(module: str, input_data: dict) -> str:
    """
    Generates an AI suggestion based on the module and input data.
    Modules supported: student, finance, disease
    """
    if not os.getenv("OPENAI_API_KEY"):
        return "AI Suggestion unavailable. Please provide an OpenAI API Key in the backend .env file."

    prompt = ""
    if module == "student":
        prompt = (
            f"As an academic counselor, analyze these student stats: "
            f"Marks: {input_data.get('marks')}, Attendance: {input_data.get('attendance')}%, "
            f"Study Hours: {input_data.get('studyHours')}h, Subject: {input_data.get('subject')}. "
            f"Provide a concise, encouraging 2-sentence piece of advice to improve their performance. "
            f"Focus on consistency and specific areas like study hours or attendance if they are low. "
            f"Do not use technical terms."
        )
    elif module == "finance":
        prompt = (
            f"As a financial advisor, analyze this budget: "
            f"Income: {input_data.get('income')}, Expenses: {input_data.get('expenses')}. "
            f"Provide a concise, practical 2-sentence piece of advice on saving and expense optimization. "
            f"Do not use technical jargon."
        )
    elif module == "disease":
        prompt = (
            f"As a health assistant, based on these symptoms: {', '.join(input_data.get('symptoms', []))}, "
            f"provide a concise 2-sentence explanation of what might be happening and general precautions. "
            f"Disclaimer: Mention this is not a medical diagnosis. Do not use technical terms."
        )
    else:
        return "Insightful suggestions are being calculated..."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for the Zentrix AI Dashboard."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return "Our AI is currently taking a break. Please try again later for smarter insights!"
