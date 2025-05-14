import sqlite3
import hashlib
import secrets
import time
from passlib.context import CryptContext

class DatabaseManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self._initialize_db()
    
    def _initialize_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            oauth_provider TEXT,
            oauth_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create reset_tokens table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Create predictions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            input_data TEXT,
            prediction_result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def register_user(self, email, password=None, oauth_provider=None, oauth_id=None):
        # Check if email already exists
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            conn.close()
            return False, "Email already registered"
        
        try:
            # Handle password or OAuth registration
            if password:
                password_hash = self.pwd_context.hash(password)
                cursor.execute(
                    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                    (email, password_hash)
                )
            elif oauth_provider and oauth_id:
                cursor.execute(
                    "INSERT INTO users (email, oauth_provider, oauth_id) VALUES (?, ?, ?)",
                    (email, oauth_provider, oauth_id)
                )
            else:
                conn.close()
                return False, "Either password or OAuth details required"
            
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
            return True, user_id
            
        except Exception as e:
            conn.rollback()
            conn.close()
            return False, f"Database error: {str(e)}"
    
    def login_user(self, email, password=None, oauth_provider=None, oauth_id=None):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Handle password login
            if password:
                cursor.execute(
                    "SELECT id, password_hash FROM users WHERE email = ?",
                    (email,)
                )
                user = cursor.fetchone()
                
                if not user:
                    conn.close()
                    return False, "Invalid email or password"
                
                user_id, password_hash = user
                
                if not self.pwd_context.verify(password, password_hash):
                    conn.close()
                    return False, "Invalid email or password"
                
                conn.close()
                return True, user_id
                
            # Handle OAuth login
            elif oauth_provider and oauth_id:
                cursor.execute(
                    "SELECT id FROM users WHERE email = ? AND oauth_provider = ? AND oauth_id = ?",
                    (email, oauth_provider, oauth_id)
                )
                user = cursor.fetchone()
                
                if not user:
                    conn.close()
                    return False, "OAuth login failed"
                
                conn.close()
                return True, user[0]
                
            else:
                conn.close()
                return False, "Invalid login method"
                
        except Exception as e:
            conn.close()
            return False, f"Database error: {str(e)}"
    
    def create_password_reset_token(self, email):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return False, "Email not found"
        
        user_id = user[0]
        
        # Generate token
        token = secrets.token_urlsafe(32)
        
        # Set expiration (24 hours)
        expires_at = int(time.time()) + 86400
        
        # Delete any existing tokens for the user
        cursor.execute("DELETE FROM reset_tokens WHERE user_id = ?", (user_id,))
        
        # Save new token
        cursor.execute(
            "INSERT INTO reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
            (user_id, token, expires_at)
        )
        
        conn.commit()
        conn.close()
        return True, token
    
    def reset_password(self, token, new_password):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if token exists and is valid
        cursor.execute(
            "SELECT user_id, expires_at FROM reset_tokens WHERE token = ?", 
            (token,)
        )
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return False, "Invalid or expired token"
        
        user_id, expires_at = result
        
        # Check if token is expired
        if int(time.time()) > expires_at:
            # Delete expired token
            cursor.execute("DELETE FROM reset_tokens WHERE token = ?", (token,))
            conn.commit()
            conn.close()
            return False, "Reset token expired"
        
        try:
            # Hash new password
            password_hash = self.pwd_context.hash(new_password)
            
            # Update user password
            cursor.execute(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                (password_hash, user_id)
            )
            
            # Delete used token
            cursor.execute("DELETE FROM reset_tokens WHERE token = ?", (token,))
            
            conn.commit()
            conn.close()
            return True, "Password reset successful"
            
        except Exception as e:
            conn.rollback()
            conn.close()
            return False, f"Database error: {str(e)}"
    
    def save_prediction(self, user_id, input_data, prediction_result):
        """Save a prediction to the database"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO predictions (user_id, input_data, prediction_result) VALUES (?, ?, ?)",
                (user_id, json.dumps(input_data), json.dumps(prediction_result))
            )
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            conn.rollback()
            conn.close()
            return False
    
    def get_predictions(self, user_id, limit=10):
        """Get predictions for a user"""
        import json
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "SELECT input_data, prediction_result, created_at FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
                (user_id, limit)
            )
            
            predictions = []
            for row in cursor.fetchall():
                input_data, prediction_result, created_at = row
                predictions.append({
                    "input_data": json.loads(input_data),
                    "prediction_result": json.loads(prediction_result),
                    "created_at": created_at
                })
            
            conn.close()
            return predictions
            
        except Exception as e:
            conn.close()
            return []