import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Standard 20 symptoms from frontend
SYMPTOMS_LIST = [
    'Fever', 'Cough', 'Headache', 'Fatigue', 'Sore Throat',
    'Runny Nose', 'Body Ache', 'Nausea', 'Dizziness', 'Chest Pain',
    'Shortness of Breath', 'Sneezing', 'Chills', 'Vomiting', 'Diarrhea',
    'Loss of Appetite', 'Joint Pain', 'Rash', 'Blurred Vision', 'Frequent Urination'
]

DISEASES = ["Common Cold", "Flu", "Migraine", "Diabetes", "Hypertension", "Allergies", "General Malaise"]

# Generate synthetic combinations
np.random.seed(42)
X_train_dis = []
y_train_dis = []

# Mapping logical weights for higher accuracy
disease_symptom_weights = {
    "Common Cold": ['Fever', 'Cough', 'Sore Throat', 'Runny Nose', 'Sneezing'],
    "Flu": ['Fever', 'Body Ache', 'Chills', 'Fatigue', 'Cough'],
    "Migraine": ['Headache', 'Blurred Vision', 'Nausea', 'Dizziness'],
    "Diabetes": ['Frequent Urination', 'Fatigue', 'Loss of Appetite', 'Blurred Vision'],
    "Hypertension": ['Chest Pain', 'Shortness of Breath', 'Dizziness', 'Headache'],
    "Allergies": ['Sneezing', 'Runny Nose', 'Rash', 'Cough']
}

for _ in range(200):
    target_disease = np.random.choice(DISEASES)
    vec = [0] * len(SYMPTOMS_LIST)
    
    if target_disease in disease_symptom_weights:
        # Heavily weight correct symptoms
        core_symptoms = disease_symptom_weights[target_disease]
        for idx, sym in enumerate(SYMPTOMS_LIST):
            if sym in core_symptoms and np.random.rand() > 0.3:
                vec[idx] = 1
            elif np.random.rand() > 0.9: # random noise
                vec[idx] = 1
    else:
        # General malaise random
        for idx in range(len(SYMPTOMS_LIST)):
            vec[idx] = 1 if np.random.rand() > 0.8 else 0
            
    X_train_dis.append(vec)
    y_train_dis.append(target_disease)

# --- TRAIN SCENE ---
rf_classifier = RandomForestClassifier(n_estimators=30, random_state=42)
rf_classifier.fit(X_train_dis, y_train_dis)

def get_precautions(disease):
    precautions = {
        "Common Cold": {"dos": ["Rest and hydrate", "Take vitamin C"], "donts": ["Avoid cold weather", "Don't overexert"]},
        "Flu": {"dos": ["Get plenty of rest", "Monitor temperature"], "donts": ["Avoid public places", "Don't ignore difficulty breathing"]},
        "Migraine": {"dos": ["Rest in dark quiet room", "Apply cold compress"], "donts": ["Avoid bright lights and screens", "Skip excessive caffeine"]},
        "Diabetes": {"dos": ["Monitor blood sugar", "Eat balanced meals"], "donts": ["Avoid sugary foods", "Don't skip medications"]},
        "Hypertension": {"dos": ["Reduce salt intake", "Exercise regularly"], "donts": ["Avoid processed foods", "Limit alcohol and smoking"]},
        "Allergies": {"dos": ["Identify allergens", "Keep environment clean"], "donts": ["Avoid known triggers", "Don't rub eyes"]},
        "General Malaise": {"dos": ["Rest adequately", "Stay hydrated"], "donts": ["Don't self diagnose completely", "Don't ignore sustained pain"]}
    }
    return precautions.get(disease, {"dos": ["Rest"], "donts": ["Avoid stress"]})

def predict_disease(user_symptoms):
    vec = [0] * len(SYMPTOMS_LIST)
    for idx, sym in enumerate(SYMPTOMS_LIST):
        if sym in user_symptoms:
            vec[idx] = 1
            
    input_data = np.array([vec])
    predicted_disease = str(rf_classifier.predict(input_data)[0])
    
    rules = get_precautions(predicted_disease)
    return predicted_disease, rules["dos"], rules["donts"]