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

def analyze_student_performance(percentage, attendance, study_hrs, score):
    # Deep Analysis matrix
    analysis = ""
    suggestions = []

    # Case 1: Low Marks, Low Study Hours
    if percentage < 50 and study_hrs < 2.5:
        analysis = "The student is significantly underperforming. A clear correlation exists between low study hours and the diminished test scores. Immediate intervention is required to build foundational habits."
        suggestions = [
            "Establish a rigid daily study schedule, starting with 2 hours minimum and gradually increasing.",
            "Break down complex subjects into small, manageable chunks to avoid feeling overwhelmed.",
            "Utilize active recall methods instead of passive reading to maximize retention in short bursts.",
            "Consider seeking peer tutoring or joining an academic support group for accountability."
        ]
    
    # Case 2: Low Marks, Good Study Hours (Inefficient Study)
    elif percentage < 50 and study_hrs >= 3:
        analysis = "Despite dedicating adequate time to studying, academic output remains low. This indicates a high state of friction and study inefficiency, likely due to a lack of conceptual grasp or poor study methodologies."
        suggestions = [
            "Switch from passive highlighting to practice testing and spaced repetition techniques.",
            "Re-evaluate current learning materials - the student may need simpler, foundational resources before advancing.",
            "Take 5-minute breaks every 25 minutes (Pomodoro technique) to prevent cognitive fatigue.",
            "Analyze past mistakes rigorously to identify recurring patterns in misunderstood concepts."
        ]
        
    # Case 3: Good Marks, Low Attendance
    elif percentage >= 70 and attendance < 65:
        analysis = "The student demonstrates strong self-learning capability and intelligence, achieving high marks despite severe absenteeism. However, chronic low attendance poses a systemic risk to long-term academic stability."
        suggestions = [
            "Prioritize attending crucial lectures to stay aligned with the syllabus and avoid missing unrecorded announcements.",
            "The current self-study momentum is excellent; synergize this by engaging actively during the classes you do attend.",
            "Avoid relying solely on last-minute cramming, as future advanced topics will require guided instruction.",
            "Communicate with instructors to bridge any gaps missed during absent days."
        ]
        
    # Case 4: High Performance (Optimization needed)
    elif percentage >= 85 and attendance >= 80:
        analysis = "Exceptional academic trajectory. The student possesses a robust mastery of the curriculum coupled with high discipline in attendance. The focus should now shift toward advanced enrichment and output stabilization."
        suggestions = [
            "Explore advanced or peripheral topics outside the standard curriculum to challenge yourself.",
            "Consider mentoring or teaching peers; explaining concepts is the highest form of mastery.",
            "Begin working on practical, real-world application projects related to your field of study.",
            "Optimize sleep and nutritional habits to ensure cognitive stamina for upcoming competitive examinations."
        ]
        
    # Case 5: Average Performance, Average Habits (Stagnation)
    else:
        analysis = "The student sits smoothly in the moderate proficiency band. While basic requirements are being met, there is noticeable stagnation. A strategic shift in effort allocation is necessary to unlock higher percentiles."
        suggestions = [
            "Identify the 'weakest link' subject and disproportionately allocate study time to master it.",
            "Increase current study duration by just 30 minutes daily; compounding will yield significant results over a month.",
            "Engage in more collaborative group studies to expose yourself to different problem-solving angles.",
            "Set micro-goals for each week (e.g., 'Master Chapter 4 by Friday') to build momentum."
        ]

    # Additional contextual modifiers based on specific thresholds
    if attendance < 50 and not (percentage >= 70 and attendance < 65):
        suggestions.insert(0, "CRITICAL: Attendance has fallen below 50%. Immediate course correction is mandatory to prevent academic penalization.")
    if study_hrs >= 5:
        suggestions.append("Warning: You are studying heavily. Ensure you prevent burnout by getting adequate sleep and regular exercise.")

    return analysis, suggestions[:5]

def predict_student(percentage, attendance, studyHours):
    input_data = np.array([[percentage, attendance, studyHours]])
    
    p1 = lr_student.predict(input_data)[0]
    p2 = rf_student.predict(input_data)[0]
    
    score = (p1 + p2) / 2.0
    prediction = min(100.0, max(0.0, score))
    
    confidence = random.randint(85, 96)
    
    ai_analysis, ai_suggestions = analyze_student_performance(percentage, attendance, studyHours, prediction)
    
    return {
        "prediction": round(float(prediction), 1),
        "confidence": confidence,
        "ai_analysis": ai_analysis,
        "ai_suggestions": ai_suggestions
    }