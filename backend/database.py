import sqlite3

conn = sqlite3.connect("zentrix.db", check_same_thread=False)
cursor = conn.cursor()

# Student Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT,
    subject TEXT,
    marks REAL,
    attendance REAL,
    study_hours REAL,
    prediction REAL,
    category TEXT,
    ai_suggestion TEXT
)
""")

# Finance Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    income REAL,
    total_expense REAL,
    savings REAL,
    savings_rate REAL,
    suggestion TEXT,
    ai_suggestion TEXT
)
""")

# Disease Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS disease (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    symptoms TEXT,
    prediction TEXT,
    dos TEXT,
    donts TEXT,
    ai_suggestion TEXT
)
""")

conn.commit()