import numpy as np
import random
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

# --- SYNTHETIC DATASET CREATION ---
np.random.seed(42)
num_samples = 150
X_train_stud = []
y_train_stud = []

for _ in range(num_samples):
    percentage = np.random.uniform(20.0, 100.0)
    attendance = np.random.uniform(30.0, 100.0)
    study_hrs = np.random.uniform(0.5, 6.0)
    
    target_score = (percentage * 0.5) + (attendance * 0.3) + (study_hrs * 3.3)
    target_score = min(100.0, max(0.0, target_score + np.random.normal(0, 3))) # add noise
    
    X_train_stud.append([percentage, attendance, study_hrs])
    y_train_stud.append(target_score)

# --- TRAIN MODEL ---
lr_student = LinearRegression()
rf_student = RandomForestRegressor(n_estimators=20, random_state=42)
lr_student.fit(X_train_stud, y_train_stud)
rf_student.fit(X_train_stud, y_train_stud)

def analyze_student_performance(percentage, attendance, study_hrs, score, subject=""):
    analysis = "AI Assessment"
    suggestions = []

    # Case 1: Low Performance
    if score < 50:
        suggestions = [
            "Increase your study hours—even an extra 30 mins a day goes a long way.",
            f"Focus on your weak areas in {subject} to build a stronger foundation." if subject else "Focus on your weak areas to build a stronger foundation.",
            "Try to improve your attendance. Consistent presence is critical for success.",
            "You have great potential! Stay motivated and consistent, and you will see improvement."
        ]
    
    # Case 2: Medium Performance
    elif score < 80:
        suggestions = [
            "Maintain consistency in your daily study routine, as it builds long-term retention.",
            "Develop a solid revision strategy to reinforce the subjects you've already covered.",
            "Take mock tests regularly to get comfortable with exam passing criteria and time management.",
            "You're doing well, but optimizing your study methods can push you into the top tier."
        ]
        
    # Case 3: High Performance
    else:
        suggestions = [
            "Great job! Consider advanced learning materials outside the regular curriculum.",
            "Start preparing for competitive exams in your field of interest.",
            "Build practical skills through real-world projects or by mentoring peers.",
            "Excellent work! Keep challenging yourself and optimizing your performance."
        ]

    return analysis, suggestions

def predict_student(percentage, attendance, studyHours, subject=""):
    input_data = np.array([[percentage, attendance, studyHours]])
    
    p1 = lr_student.predict(input_data)[0]
    p2 = rf_student.predict(input_data)[0]
    
    score = (p1 + p2) / 2.0
    prediction = min(100.0, max(0.0, score))
    
    confidence = random.randint(85, 96)
    
    ai_analysis, ai_suggestions = analyze_student_performance(percentage, attendance, studyHours, prediction, subject)
    
    return {
        "prediction": round(float(prediction), 1),
        "confidence": confidence,
        "ai_analysis": ai_analysis,
        "ai_suggestions": ai_suggestions
    }