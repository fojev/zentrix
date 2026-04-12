import sqlite3

# Initialize memory stores (database-ready structure)
students_db = []
finance_db = []
disease_db = []

# ID Counter for in-memory students
student_id_counter = 1

conn = sqlite3.connect("zentrix.db", check_same_thread=False)
cursor = conn.cursor()
# ... (rest of the code remains same)

# Student Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    subject TEXT,
    marks REAL,
    attendance REAL,
    study_hours REAL,
    prediction REAL,
    category TEXT
)
""")

# Finance Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    income REAL,
    total_expense REAL,
    savings REAL,
    suggestion TEXT
)
""")

# Disease Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS disease (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symptoms TEXT,
    prediction TEXT,
    dos TEXT,
    donts TEXT
)
""")

conn.commit()