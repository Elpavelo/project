from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional
import joblib
import numpy as np
import pandas as pd
import traceback
import requests
from auth_service import get_current_user # type: ignore
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained pipeline and label encoder
try:
    pipeline = joblib.load("employee_performance_pipeline.pkl")
    label_encoder = joblib.load("label_encoder.pkl")
    print("Successfully loaded model files")
except Exception as e:
    print(f"Error loading models: {e}")
    # Initialize empty placeholders to prevent app from crashing if files not found
    pipeline = None
    label_encoder = None

# Employee Data Model
class EmployeeData(BaseModel):
    hours_worked: float
    projects_completed: int
    attendance_score: float
    peer_feedback: float
    manager_feedback: float
    
    # Data validation
    @validator('hours_worked')
    def hours_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('hours_worked must be positive')
        return v
    
    @validator('projects_completed')
    def projects_must_be_nonnegative(cls, v):
        if v < 0:
            raise ValueError('projects_completed cannot be negative')
        return v
    
    @validator('attendance_score', 'peer_feedback', 'manager_feedback')
    def scores_must_be_in_range(cls, v):
        if v < 0 or v > 10:
            raise ValueError('scores must be between 0 and 10')
        return v

# Import and mount authentication service
from auth_service import create_auth_app # type: ignore
auth_app = create_auth_app()
app.mount("/auth", auth_app)

# Prediction route with authentication
@app.post("/predict")
async def predict_performance(data: EmployeeData, current_user: dict = Depends(get_current_user)):
    if pipeline is None or label_encoder is None:
        print("Models not loaded properly")
        raise HTTPException(status_code=500, detail="Models not loaded properly")
    
    try:
        # Create a dataframe from input data
        print(f"Received data: {data}")
        input_data = data.dict()
        input_df = pd.DataFrame({
            'hours_worked': [input_data['hours_worked']],
            'projects_completed': [input_data['projects_completed']],
            'attendance_score': [input_data['attendance_score']],
            'peer_feedback': [input_data['peer_feedback']],
            'manager_feedback': [input_data['manager_feedback']]
        })
        
        # Calculate the derived features (same as in training)
        input_df['productivity_ratio'] = input_df['projects_completed'] / input_df['hours_worked']
        input_df['feedback_avg'] = (input_df['peer_feedback'] + input_df['manager_feedback']) / 2
        input_df['feedback_diff'] = abs(input_df['peer_feedback'] - input_df['manager_feedback'])
        
        # Use the pipeline for prediction (includes scaling and feature selection)
        prediction = pipeline.predict(input_df)
        prediction_proba = pipeline.predict_proba(input_df)[0]
        
        # Get the performance label
        performance_label = label_encoder.inverse_transform(prediction)[0]
        
        # Create response
        response = {
            "performance_prediction": performance_label,
            "confidence": float(max(prediction_proba)),
            "class_probabilities": {
                label_encoder.inverse_transform([i])[0]: float(prob) 
                for i, prob in enumerate(prediction_proba)
            }
        }
        
        # Save prediction to database
        # Note: you would need to implement this function or adapt it to work with your DB
        # db.save_prediction(current_user["user_id"], input_data, response)
        
        return response
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/predictions/history")
async def get_prediction_history(current_user: dict = Depends(get_current_user)):
    # This function would need to be implemented based on your database structure
    # For now, returning a placeholder response
    return {"predictions": []}

@app.get("/")
def root():
    return {"message": "Employee Performance Prediction API is running!"}

@app.get("/test")
def test():
    return {"status": "API is working"}

@app.get("/model-info")
def model_info():
    if pipeline is None or label_encoder is None:
        return {"status": "Models not loaded properly"}
        
    try:
        # Get feature importances from the pipeline
        model = pipeline.named_steps['model']
        if hasattr(model, 'feature_importances_'):
            # Get selected features from the pipeline
            feature_selector = pipeline.named_steps['feature_selector']
            all_features = ['hours_worked', 'projects_completed', 'attendance_score', 
                           'peer_feedback', 'manager_feedback', 'productivity_ratio', 
                           'feedback_avg', 'feedback_diff']
            selected_indices = feature_selector.get_support()
            selected_features = [feat for i, feat in enumerate(all_features) if i < len(selected_indices) and selected_indices[i]]
            
            importances = model.feature_importances_
            feature_importance = dict(zip(selected_features, importances[:len(selected_features)]))
            
            # Sort by importance
            sorted_importance = {k: v for k, v in sorted(
                feature_importance.items(), key=lambda item: item[1], reverse=True
            )}
            
            return {
                "model_type": type(model).__name__,
                "feature_importance": sorted_importance,
                "classes": label_encoder.classes_.tolist(),
                "model_loaded": True
            }
        else:
            return {
                "model_type": type(model).__name__,
                "classes": label_encoder.classes_.tolist(),
                "model_loaded": True
            }
    except Exception as e:
        print(f"Error in model info: {str(e)}")
        traceback.print_exc()
        return {"error": f"Could not retrieve model info: {str(e)}"}

# For direct testing if this file is run
if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
