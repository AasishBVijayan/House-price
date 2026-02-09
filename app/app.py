from fastapi import FastAPI
import joblib
import numpy as np
import pandas as pd

app = FastAPI()

model = joblib.load("house_price_pipeline.pkl")

@app.get("/")
def root():
    return {"status": "API is running"}

@app.post("/predict")
def predict(data: HouseInput):
    df = pd.DataFrame([data.dict()])
    pred = pipeline.predict(df)
    price = np.expm1(pred)

    return {"predicted_price": float(price[0])}



from pydantic import BaseModel

class HouseInput(BaseModel):
    overall_qual: int
    gr_liv_area: float
    garage_cars: int
    total_bsmt_sf: float
    full_bath: int
    year_built: int

