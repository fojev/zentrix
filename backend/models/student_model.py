import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

# Dummy training data for initialization
X_train = np.array([
    [50, 60, 2],
    [70, 75, 3],
    [85, 90, 4],
    [40, 50, 1],
    [95, 95, 6],
    [60, 65, 2.5]
])
y_train = np.array([55, 72, 88, 45, 96, 62])

lr_model = LinearRegression()
rf_model = RandomForestRegressor(n_estimators=10)

lr_model.fit(X_train, y_train)
rf_model.fit(X_train, y_train)

def get_student_suggestions(marks, attendance, studyHours):
    suggestions = []
    if marks < 50: 
        suggestions.append("Focus on understanding core concepts. Consider tutoring or study groups.")
    if marks < 70:
        suggestions.append("Practice more problems and past papers to improve marks.")
    if attendance < 75:
        suggestions.append("Improve attendance — regular class participation is strongly linked to better performance.")
    if studyHours < 3:
        suggestions.append("Increase daily study hours to at least 3-4 hours for consistent improvement.")
    
    if not suggestions:
        suggestions.append("Keep up the good work! Stay consistent with your efforts.")
    
    return suggestions

def predict_student(marks, attendance, studyHours):
    # Ensure input is 2D
    input_data = np.array([[marks, attendance, studyHours]])
    
    lr_pred = lr_model.predict(input_data)[0]
    rf_pred = rf_model.predict(input_data)[0]
    
    # Clip predictions to 0-100
    lr_pred = min(100, max(0, lr_pred))
    rf_pred = min(100, max(0, rf_pred))
    
    avg_score = (lr_pred + rf_pred) / 2
    
    if avg_score >= 85:
        category = "Excellent"
    elif avg_score >= 70:
        category = "Good"
    elif avg_score >= 50:
        category = "Average"
    else:
        category = "Poor"
    
    suggestions = get_student_suggestions(marks, attendance, studyHours)
    
    return {
        "lrScore": round(lr_pred, 1),
        "rfScore": round(rf_pred, 1),
        "avgScore": round(avg_score, 1),
        "category": category,
        "suggestions": suggestions
    }