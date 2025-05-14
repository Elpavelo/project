import sqlite3
import os
import hashlib
import secrets

def create_database():
    # Create database file if it doesn't exist
    db_exists = os.path.exists('app.db')
    
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        salt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        oauth_provider TEXT,
        oauth_id TEXT,
        is_active BOOLEAN DEFAULT 1
    )
    ''')
    
    # Create prediction_history table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        hours_worked REAL NOT NULL,
        projects_completed INTEGER NOT NULL,
        attendance_score REAL NOT NULL,
        peer_feedback REAL NOT NULL,
        manager_feedback REAL NOT NULL,
        productivity_ratio REAL,
        feedback_avg REAL,
        feedback_diff REAL,
        performance_prediction TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Create password_reset table for forgot password functionality
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS password_reset (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        reset_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Commit the changes and close the connection
    conn.commit()
    
    # Create admin user if database is newly created
    if not db_exists:
        # Generate salt and hash for default password
        salt = secrets.token_hex(16)
        password = "admin123"  # Default password
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        
        # Insert admin user
        cursor.execute(
            "INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)",
            ("admin@example.com", password_hash, salt)
        )
        conn.commit()
        print("Database created with admin user. Email: admin@example.com, Password: admin123")
    else:
        print("Database already exists, tables updated if needed.")
    
    conn.close()

if __name__ == "__main__":
    create_database()
