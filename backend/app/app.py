from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException

app = FastAPI()

pipeline = joblib.load("house_price_pipeline.pkl")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
        # Convert request to dataframe using the modern model_dump()
        df = pd.DataFrame([data.model_dump()])

        # Rename columns to match training data exactly
        df = df.rename(columns={
            "overall_qual": "Overall Qual",
            "gr_liv_area": "Gr Liv Area",
            "garage_cars": "Garage Cars",
            "total_bsmt_sf": "Total Bsmt SF",
            "full_bath": "Full Bath",
            "year_built": "Year Built"
        })

        # Make prediction and reverse the log transformation
        pred_log = pipeline.predict(df)
        price = np.expm1(pred_log)

        return {"predicted_price": float(price[0])}
        
    except Exception as e:
        # Catch any errors and send a 400 Bad Request back to React
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")