from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

app = FastAPI()

pipeline = joblib.load("house_price_pipeline.pkl")

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
    df = pd.DataFrame([data.dict()])
    pred_log = pipeline.predict(df)
    price = np.expm1(pred_log)

    return {"predicted_price": float(price[0])}
