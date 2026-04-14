import numpy as np
from sklearn.linear_model import LinearRegression

# --- SYNTHETIC DATASET CREATION ---
np.random.seed(42)
X_train_fin = []
y_train_fin = []

for _ in range(150):
    income = np.random.uniform(1000, 15000)
    expenses = np.random.uniform(500, income + 1000) # sometimes overspending
    savings = income - expenses
    
    X_train_fin.append([income, expenses])
    y_train_fin.append(savings)

# --- TRAIN SCENE ---
lr_finance = LinearRegression()
lr_finance.fit(X_train_fin, y_train_fin)

def analyze_finance(income, expenses_dict):
    total_expense = sum(expenses_dict.values())
    
    # Model predict savings
    input_data = np.array([[income, total_expense]])
    predicted_savings = lr_finance.predict(input_data)[0]
    
    # Calculate accurate rate tracking based on the prediction
    savings_rate = (predicted_savings / income * 100) if income > 0 else 0
    
    suggestions = []
    if total_expense > income:
        suggestions.append("Your expenses exceed your income. It is crucial to reduce unnecessary spending immediately.")
        suggestions.append("Create a strict budgeting plan to track every dollar and regain financial control.")
    elif savings_rate < 20:
        suggestions.append("Your savings are lower than optimal. Consider exploring better saving strategies.")
        suggestions.append("Look into safe investment options to make the most of your available savings.")
    else:
        suggestions.append("You have excellent financial health! Keep up the smart money management.")
        suggestions.append("Look into smart investments and mutual funds to aggressively grow your wealth.")
        suggestions.append("Consider exploring passive income ideas to diversify your revenue streams.")
        
    return {
        "income": float(income),
        "total_expense": float(total_expense),
        "savings": round(float(predicted_savings), 2),
        "savings_rate": round(float(savings_rate), 1),
        "suggestions": suggestions
    }