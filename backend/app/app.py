import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 1. FIXED PATHING - Ensures Vercel finds the pkl file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "house_price_pipeline.pkl")

# Global variable to hold the model so it doesn't reload every time
pipeline = joblib.load(MODEL_PATH)

# 2. FIXED CORS - Wildcard allows Vercel frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HouseInput(BaseModel):
    overall_qual: int
    gr_liv_area: float
    garage_cars: int
    total_bsmt_sf: float
    full_bath: int
    year_built: int

@app.get("/")
def root():
    return {"status": "API is running"}

@app.post("/predict")
def predict(data: HouseInput):
    try:
        # 3. CONVERT TO NUMPY (Removes Pandas dependency)
        # The order here MUST match the order your model was trained on
        features = np.array([[
            data.overall_qual,
            data.gr_liv_area,
            data.garage_cars,
            data.total_bsmt_sf,
            data.full_bath,
            data.year_built
        ]])

        # 4. PREDICT
        pred_log = pipeline.predict(features)
        
        # Reverse log transformation (assuming training used log1p)
        price = np.expm1(pred_log)

        return {"predicted_price": float(price[0])}
        
    except Exception as e:
        # If your pipeline specifically requires a DataFrame, this might error.
        # If it does, we will revert to Pandas but optimize elsewhere.
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")