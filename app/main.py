import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from app.schemas import CarInput, PriceOutput

app = FastAPI(title="CarPrice API", version="1.0")

model_low       = joblib.load("model/model_low.pkl")
model_mid       = joblib.load("model/model_mid.pkl")
model_high      = joblib.load("model/model_high.pkl")
feature_columns = joblib.load("processed/feature_columns.pkl")
scaler          = joblib.load("processed/scaler.pkl")

SCALER_COLS = ["mileage", "engineSize", "mpg", "car_age"]
GBP_TO_EUR  = 1.149

def build_features(car: CarInput) -> pd.DataFrame:
    car_age = 2020 - car.year
    mileage = np.log1p(car.mileage)

    row = {col: 0 for col in feature_columns}

    row["mileage"]    = mileage
    row["engineSize"] = car.engineSize
    row["mpg"]        = car.mpg
    row["car_age"]    = car_age

    brand_col        = f"brand_{car.brand.lower()}"
    model_col        = f"model_{car.model}"
    fuel_col         = f"fuelType_{car.fuelType}"
    transmission_col = f"transmission_{car.transmission}"

    if brand_col        in row: row[brand_col]        = 1
    if model_col        in row: row[model_col]        = 1
    if fuel_col         in row: row[fuel_col]         = 1
    if transmission_col in row: row[transmission_col] = 1

    df = pd.DataFrame([row])
    df[SCALER_COLS] = scaler.transform(df[SCALER_COLS])

    return df

@app.get("/")
def root():
    return {"status": "ok", "api": "CarPrice v1.0"}

@app.post("/predict", response_model=PriceOutput)
def predict(car: CarInput):
    features = build_features(car)

    low_gbp  = float(np.expm1(model_low.predict(features)[0]))
    mid_gbp  = float(np.expm1(model_mid.predict(features)[0]))
    high_gbp = float(np.expm1(model_high.predict(features)[0]))

    low_eur  = round(low_gbp  * GBP_TO_EUR, 2)
    mid_eur  = round(mid_gbp  * GBP_TO_EUR, 2)
    high_eur = round(high_gbp * GBP_TO_EUR, 2)

    return PriceOutput(
        low_price_eur=low_eur,
        fair_price_eur=mid_eur,
        high_price_eur=high_eur,
        summary_eur=f"€{low_eur:,.0f} — €{mid_eur:,.0f} — €{high_eur:,.0f}"
    )