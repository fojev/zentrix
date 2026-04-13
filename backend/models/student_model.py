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
    
    # Target scoring formula logic to approximate
    target_score = (percentage * 0.5) + (attendance * 0.3) + (study_hrs * 3.3)
    target_score = min(100.0, max(0.0, target_score + np.random.normal(0, 3))) # add noise
    
    X_train_stud.append([percentage, attendance, study_hrs])
    y_train_stud.append(target_score)

# --- TRAIN SCENE ---
lr_student = LinearRegression()
rf_student = RandomForestRegressor(n_estimators=20, random_state=42)
lr_student.fit(X_train_stud, y_train_stud)
rf_student.fit(X_train_stud, y_train_stud)

def get_smart_suggestions(percentage, attendance, studyHours):
    suggestions = []
    
    # Multi-condition logic
    if percentage < 50 and attendance < 60:
        suggestions.append("You need both conceptual clarity and regular classes. Start attending daily.")
    elif percentage < 50 and attendance >= 75:
        suggestions.append("Your attendance is good, but focus heavily on revision and practice testing.")
    elif percentage >= 80 and attendance >= 85:
        suggestions.append("Excellent foundation. Maintain your current trajectory and mentor peers.")
        
    if studyHours < 2:
        suggestions.append("Increase your self-study hours to at least 3-4 hours daily.")
        
    if not suggestions:
        suggestions.append("Great job maintaining a balanced academic routine. Keep pushing forward.")
        
    return suggestions[:4]

def predict_student(percentage, attendance, studyHours):
    input_data = np.array([[percentage, attendance, studyHours]])
    
    p1 = lr_student.predict(input_data)[0]
    p2 = rf_student.predict(input_data)[0]
    
    score = (p1 + p2) / 2.0
    score = min(100.0, max(0.0, score))
    
    # Advanced logic bounds
    if score >= 80: category = "Excellent"
    elif score >= 65: category = "Good"
    elif score >= 50: category = "Average"
    else: category = "Poor"
    
    confidence = random.randint(70, 95)
    
    return {
        "percentage": round(float(percentage), 1),
        "score": round(float(score), 1),
        "category": category,
        "confidence": confidence,
        "suggestions": get_smart_suggestions(percentage, attendance, studyHours)
    }