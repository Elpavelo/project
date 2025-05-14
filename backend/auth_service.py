from fastapi import FastAPI, HTTPException, Depends, Request, Response, Cookie, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator, EmailStr
from typing import Optional
import jwt
import time
from datetime import datetime, timedelta
import secrets
from database1 import DatabaseManager

# JWT Configuration
JWT_SECRET = "your-super-secure-jwt-secret-key"  # Change this in production!
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 60 * 60 * 24  # 24 hours in seconds

# Initialize database manager
db = DatabaseManager('app.db')

# Authentication Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('passwords do not match')
        return v

class OAuthLogin(BaseModel):
    email: EmailStr
    provider: str
    provider_id: str
    provider_token: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('passwords do not match')
        return v

# Helper functions for authentication
def create_jwt_token(user_id: int) -> str:
    expires = datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION)
    to_encode = {
        "sub": str(user_id),
        "exp": expires,
        "iat": datetime.utcnow()
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str):
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return {"user_id": int(user_id)}
    except jwt.PyJWTError:
        return None

async def get_current_user(request: Request) -> dict:
    """Extract and validate JWT token from cookies or authorization header"""
    token = None
    
    # Try to get token from cookies first
    token = request.cookies.get("access_token")
    
    # If not in cookies, check authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header:
            if auth_header.startswith("Bearer "):
                token = auth_header.split("Bearer ")[1]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_data = decode_jwt_token(token)
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_data

def create_auth_app():
    """Create a dedicated FastAPI app for authentication"""
    auth_app = FastAPI()
    
    # Add CORS middleware to allow cross-origin requests
    auth_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Signup route
    @auth_app.post("/signup")
    async def signup(user_data: UserSignup):
        # Register user
        success, result = db.register_user(email=user_data.email, password=user_data.password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result
            )
        
        # Create JWT token
        token = create_jwt_token(result)
        
        response = JSONResponse({
            "message": "User registered successfully",
            "user_id": result
        })
        
        # Set token as HTTP-only cookie
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            max_age=JWT_EXPIRATION,
            samesite="lax"
        )
        
        return response
    
    # Login route
    @auth_app.post("/login")
    async def login(user_data: UserLogin):
        # Authenticate user
        success, result = db.login_user(email=user_data.email, password=user_data.password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result
            )
        
        # Create JWT token
        token = create_jwt_token(result)
        
        response = JSONResponse({
            "message": "Login successful",
            "user_id": result
        })
        
        # Set token as HTTP-only cookie
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            max_age=JWT_EXPIRATION,
            samesite="lax"
        )
        
        return response
    
    # OAuth login route
    @auth_app.post("/oauth-login")
    async def oauth_login(oauth_data: OAuthLogin):
        # First check if user exists
        success, result = db.login_user(
            email=oauth_data.email, 
            oauth_provider=oauth_data.provider, 
            oauth_id=oauth_data.provider_id
        )
        
        if not success:
            # If login fails, try to register the user
            success, result = db.register_user(
                email=oauth_data.email, 
                oauth_provider=oauth_data.provider, 
                oauth_id=oauth_data.provider_id
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=result
                )
        
        # Create JWT token
        token = create_jwt_token(result)
        
        response = JSONResponse({
            "message": "OAuth login successful",
            "user_id": result
        })
        
        # Set token as HTTP-only cookie
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            max_age=JWT_EXPIRATION,
            samesite="lax"
        )
        
        return response
    
    # Logout route
    @auth_app.post("/logout")
    async def logout():
        response = JSONResponse({"message": "Logout successful"})
        
        # Clear the cookie
        response.delete_cookie(key="access_token")
        
        return response
    
    # Forgot password route
    @auth_app.post("/forgot-password")
    async def forgot_password(data: ForgotPassword):
        success, token = db.create_password_reset_token(data.email)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=token
            )
        
        # In a real application, you would send an email with a reset link
        return {
            "message": "If the email exists in our system, a password reset link has been sent.",
            "debug_token": token  # Remove in production
        }
    
    # Reset password route
    @auth_app.post("/reset-password")
    async def reset_password(data: ResetPassword):
        success, result = db.reset_password(data.token, data.new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result
            )
        
        return {"message": result}
    
    # Get current user route
    @auth_app.get("/me")
    async def get_me(current_user: dict = Depends(get_current_user)):
        # Here you could fetch more user data from the database if needed
        return {"user_id": current_user["user_id"]}
    
    # Token validation route for other services
    @auth_app.post("/validate-token")
    async def validate_token(request: Request):
        try:
            user = await get_current_user(request)
            return {"valid": True, "user_id": user["user_id"]}
        except HTTPException:
            return {"valid": False}
    
    return auth_app
