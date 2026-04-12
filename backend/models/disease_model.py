def predict_disease(symptoms):
    # Simplified mapping for demonstration
    disease_map = {
        "Fever,Cough,Sore Throat": "Common Cold",
        "Fever,Body Ache,Chills": "Flu",
        "Headache,Blurred Vision,Nausea": "Migraine",
        "Frequent Urination,Fatigue,Loss of Appetite": "Diabetes",
        "Chest Pain,Shortness of Breath,Dizziness": "Hypertension",
        "Sneezing,Runny Nose,Rash": "Allergies"
    }

    # Basic matching logic
    symptoms_set = set(symptoms)
    predicted_disease = "General Malaise"
    max_matches = 0

    for sym_str, disease in disease_map.items():
        match_count = len(symptoms_set.intersection(set(sym_str.split(','))))
        if match_count > max_matches:
            max_matches = match_count
            predicted_disease = disease

    suggestions = {
        "Common Cold": {
            "dos": ["Rest and stay hydrated", "Take vitamin C supplements", "Use honey and warm water for throat"],
            "donts": ["Avoid cold beverages", "Don't overexert yourself"]
        },
        "Flu": {
            "dos": ["Get plenty of rest", "Drink warm fluids", "Monitor temperature"],
            "donts": ["Avoid going to public places", "Avoid strenuous activity"]
        },
        "Migraine": {
            "dos": ["Rest in a dark quiet room", "Apply cold compress", "Stay hydrated"],
            "donts": ["Avoid bright lights and loud sounds", "Don't ignore recurring episodes"]
        },
        "Diabetes": {
            "dos": ["Monitor blood sugar regularly", "Eat balanced meals", "Exercise regularly"],
            "donts": ["Avoid sugary foods and drinks", "Don't skip medications"]
        },
        "Hypertension": {
            "dos": ["Reduce salt intake", "Exercise regularly", "Monitor blood pressure"],
            "donts": ["Avoid processed foods", "Don't smoke", "Limit alcohol"]
        },
        "Allergies": {
            "dos": ["Identify and avoid allergens", "Keep environment clean"],
            "donts": ["Avoid known triggers", "Don't ignore persistent symptoms"]
        },
        "General Malaise": {
            "dos": ["Consult a healthcare professional", "Rest adequately", "Stay hydrated"],
            "donts": ["Don't self-diagnose", "Don't delay seeking medical help"]
        }
    }

    result = suggestions.get(predicted_disease)
    return predicted_disease, result["dos"], result["donts"]