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
        "Common Cold": {
            "precautions": ["Rest and stay warm", "Use a humidifier to ease congestion"],
            "dos": ["Drink plenty of warm fluids", "Take vitamin C rich foods"], 
            "donts": ["Don't go out in severe cold weather", "Don't consume refrigerated drinks"],
            "lifestyle": ["Maintain good hygiene", "Wash hands frequently before eating"]
        },
        "Flu": {
            "precautions": ["Isolate yourself to avoid spreading", "Monitor body temperature"],
            "dos": ["Get plenty of quality sleep", "Stay thoroughly hydrated"], 
            "donts": ["Avoid public places and crowds", "Don't ignore severe breathing issues"],
            "lifestyle": ["Eat immune-boosting whole foods", "Rest adequately until fully recovered"]
        },
        "Migraine": {
            "precautions": ["Keep your environment quiet", "Rest in a completely dark room"],
            "dos": ["Apply a cold compress to the forehead", "Drink enough water"], 
            "donts": ["Avoid bright screens and flashing lights", "Skip excessive caffeine and loud noise"],
            "lifestyle": ["Maintain a regular sleep schedule", "Actively manage and reduce stress"]
        },
        "Diabetes": {
            "precautions": ["Regularly check blood sugar levels", "Always carry a quick sugar source"],
            "dos": ["Eat portion-controlled balanced meals", "Exercise moderately each day"], 
            "donts": ["Avoid refined and artificial sugars", "Don't skip or delay any medications"],
            "lifestyle": ["Adopt a low glycemic index diet", "Stay physically active and walk daily"]
        },
        "Hypertension": {
            "precautions": ["Monitor blood pressure frequently", "Minimize sudden stressful triggers"],
            "dos": ["Reduce salt and sodium intake", "Eat potassium-rich fruits like bananas"], 
            "donts": ["Avoid processed and junk foods", "Limit alcohol consumption and avoid smoking"],
            "lifestyle": ["Incorporate daily cardiovascular exercise", "Practice deep breathing or meditation"]
        },
        "Allergies": {
            "precautions": ["Keep allergy medications ready", "Use indoor air purifiers"],
            "dos": ["Identify specific allergens", "Keep your immediate environment clean"], 
            "donts": ["Avoid known environmental triggers", "Don't rub your eyes vigorously"],
            "lifestyle": ["Clean house regularly to remove dust", "Check local pollen forecasts daily"]
        },
        "General Malaise": {
            "precautions": ["Monitor symptoms closely for progression", "Take adequate physical rest"],
            "dos": ["Stay well-hydrated", "Eat easily digestible light meals"], 
            "donts": ["Don't overexert yourself physically", "Don't ignore symptoms if they worsen"],
            "lifestyle": ["Prioritize 8 hours of sleep", "Reduce mental and physical load temporarily"]
        }
    }
    return precautions.get(disease, {
        "precautions": ["Take adequate rest"], 
        "dos": ["Consult a doctor if symptoms persist"], 
        "donts": ["Avoid physical and mental stress"], 
        "lifestyle": ["Maintain a healthy routine"]
    })

def predict_disease(user_symptoms):
    vec = [0] * len(SYMPTOMS_LIST)
    for idx, sym in enumerate(SYMPTOMS_LIST):
        if sym in user_symptoms:
            vec[idx] = 1
            
    input_data = np.array([vec])
    predicted_disease = str(rf_classifier.predict(input_data)[0])
    
    rules = get_precautions(predicted_disease)
    return predicted_disease, rules["precautions"], rules["dos"], rules["donts"], rules["lifestyle"]