import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 1. FIXED PATHING
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
pipeline = joblib.load(os.path.join(BASE_DIR, "house_price_pipeline.pkl"))

# 2. FIXED CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Use "*" temporarily to ensure the connection works
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
        # 3. Predict
        df = pd.DataFrame([data.model_dump()])
        df = df.rename(columns={
            "overall_qual": "Overall Qual",
            "gr_liv_area": "Gr Liv Area",
            "garage_cars": "Garage Cars",
            "total_bsmt_sf": "Total Bsmt SF",
            "full_bath": "Full Bath",
            "year_built": "Year Built"
        })

        pred_log = pipeline.predict(df)
        price = np.expm1(pred_log)

        return {"predicted_price": float(price[0])}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))