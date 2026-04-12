def analyze_finance(income, expenses):
    total_expense = sum(expenses.values())
    savings = income - total_expense
    savings_rate = (savings / income * 100) if income > 0 else 0

    suggestions = []
    
    if savings_rate < 10:
        suggestions.append("Your savings rate is below 10%. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.")
    if savings_rate < 0:
        suggestions.append("⚠️ You are overspending. Immediately review and cut non-essential expenses.")
    elif savings_rate >= 20:
        suggestions.append("Great savings rate! Consider investing in index funds or retirement accounts.")

    # High expense detection
    for cat, val in expenses.items():
        if val / income > 0.3:
            suggestions.append(f"{cat} takes {(val / income * 100):.0f}% of your income. Look for ways to reduce this.")
            
    if expenses.get('Entertainment', 0) / income > 0.1:
        suggestions.append("Entertainment spending is high. Set a monthly entertainment budget.")
    if expenses.get('Food', 0) / income > 0.15:
        suggestions.append("Consider meal planning and cooking at home to reduce food expenses.")

    if not suggestions:
        suggestions.append("Your finances look healthy! Keep tracking and stay disciplined.")

    return {
        "income": income,
        "total_expense": total_expense,
        "savings": savings,
        "savings_rate": round(savings_rate, 1),
        "suggestions": suggestions
    }