import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from app.schemas import CarInput, PriceOutput, EvaluateInput, EvaluateOutput, CompareInput, CompareOutput, CarCompareOutput, CarBasicInfo
from fastapi.middleware.cors import CORSMiddleware
from app.analytics import router as analytics_router
from app.services.vin_service import decode_vin

from typing import Optional

app = FastAPI(title="CarPrice API", version="1.0")
app.include_router(analytics_router)

model_low       = joblib.load("model/model_low.pkl")
model_mid       = joblib.load("model/model_mid.pkl")
model_high      = joblib.load("model/model_high.pkl")
feature_columns = joblib.load("processed/feature_columns.pkl")
scaler          = joblib.load("processed/scaler.pkl")

SCALER_COLS = ["mileage", "engineSize", "mpg", "car_age"]
GBP_TO_EUR  = 1.149


df = pd.read_csv("data/dataCleaned.csv")  

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

def calculate_scores(car, fair_price, weights):
    """Calculate weighted scores for a car based on user priorities"""
    
    perf_score = min(100, (car.engineSize / 4.0) * 100)
    
   
    avg_price = 15000
    if fair_price <= avg_price:
        val_score = 100 - ((fair_price / avg_price) * 50)
    else:
        val_score = max(0, 100 - ((fair_price - avg_price) / avg_price * 100))
    
   
    eff_score = min(100, (car.mpg / 50.0) * 100)
 
    car_age = 2020 - car.year
    mod_score = max(0, 100 - (car_age * 8))
    
    
    prac_score = max(0, 100 - (car.mileage / 150000 * 100)) if car.mileage < 150000 else 0
   
    weighted_scores = {
        "performance": round(perf_score * weights.get("performance", 0) / 100, 1),
        "value": round(val_score * weights.get("value", 0) / 100, 1),
        "efficiency": round(eff_score * weights.get("efficiency", 0) / 100, 1),
        "modernity": round(mod_score * weights.get("modernity", 0) / 100, 1),
        "practicality": round(prac_score * weights.get("practicality", 0) / 100, 1)
    }
    
    total_score = sum(weighted_scores.values())
    
    return weighted_scores, round(total_score, 1)

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

@app.post("/evaluate", response_model=EvaluateOutput)
def evaluate(car: EvaluateInput):
    car_for_features = CarInput(
        brand=car.brand,
        model=car.model,
        year=car.year,
        mileage=car.mileage,
        fuelType=car.fuelType,
        transmission=car.transmission,
        engineSize=car.engineSize,
        mpg=car.mpg,
    )
    features = build_features(car_for_features)

    low_gbp  = float(np.expm1(model_low.predict(features)[0]))
    mid_gbp  = float(np.expm1(model_mid.predict(features)[0]))
    high_gbp = float(np.expm1(model_high.predict(features)[0]))

    low_eur  = round(low_gbp  * GBP_TO_EUR, 2)
    mid_eur  = round(mid_gbp  * GBP_TO_EUR, 2)
    high_eur = round(high_gbp * GBP_TO_EUR, 2)

    asked = round(car.asked_price, 2)
    savings = round(mid_eur - asked, 2)

    ratio = asked / mid_eur if mid_eur > 0 else 1

    if ratio <= 0.85:
        verdict = "Great Deal"
        color   = "green"
    elif ratio <= 1.05:
        verdict = "Fair Price"
        color   = "blue"
    elif ratio <= 1.20:
        verdict = "Slightly Overpriced"
        color   = "orange"
    else:
        verdict = "Way Overpriced"
        color   = "red"

    return EvaluateOutput(
        low_price_eur=low_eur,
        fair_price_eur=mid_eur,
        high_price_eur=high_eur,
        asked_price_eur=asked,
        verdict=verdict,
        verdict_color=color,
        summary_eur=f"€{low_eur:,.0f} — €{mid_eur:,.0f} — €{high_eur:,.0f}",
        savings_eur=savings,
    )



@app.get("/cars/brands")
def get_brands():
    """Get all unique brands from dataset"""
    brands = sorted(df['brand'].str.lower().unique().tolist())
    return {"brands": brands}

@app.get("/cars/models/{brand}")
def get_models(brand: str):
    """Get all models for a specific brand"""
    models = sorted(df[df['brand'].str.lower() == brand.lower()]['model'].unique().tolist())
    return {"models": models}

@app.get("/cars/years/{brand}/{model}")
def get_years(brand: str, model: str):
    """Get all years for a specific brand and model"""
    years = sorted(df[(df['brand'].str.lower() == brand.lower()) & 
                      (df['model'] == model)]['year'].unique().tolist(), reverse=True)
    return {"years": years}

@app.get("/cars/details/{brand}/{model}/{year}")
def get_car_details(brand: str, model: str, year: int):
    """Get full car details for a specific car"""
    car_data = df[(df['brand'].str.lower() == brand.lower()) & 
                  (df['model'] == model) & 
                  (df['year'] == year)]
    
    if car_data.empty:
        raise HTTPException(status_code=404, detail="Car not found")
    
    car_row = car_data.iloc[0]
    
    return CarBasicInfo(
        brand=car_row['brand'],
        model=car_row['model'],
        year=int(car_row['year']),
        mileage=float(car_row['mileage']),
        fuelType=car_row['fuelType'],
        transmission=car_row['transmission'],
        engineSize=float(car_row['engineSize']),
        mpg=float(car_row['mpg']),
        price=float(car_row['price']) if 'price' in car_row else None
    )

@app.post("/compare", response_model=CompareOutput)
def compare(cars: CompareInput):
    
    car1_input = CarInput(
        brand=cars.car1.brand,
        model=cars.car1.model,
        year=cars.car1.year,
        mileage=cars.car1.mileage,
        fuelType=cars.car1.fuelType,
        transmission=cars.car1.transmission,
        engineSize=cars.car1.engineSize,
        mpg=cars.car1.mpg
    )
    
    car2_input = CarInput(
        brand=cars.car2.brand,
        model=cars.car2.model,
        year=cars.car2.year,
        mileage=cars.car2.mileage,
        fuelType=cars.car2.fuelType,
        transmission=cars.car2.transmission,
        engineSize=cars.car2.engineSize,
        mpg=cars.car2.mpg
    )
    
    features1 = build_features(car1_input)
    features2 = build_features(car2_input)
    
  
    mid_gbp1 = float(np.expm1(model_mid.predict(features1)[0]))
    mid_gbp2 = float(np.expm1(model_mid.predict(features2)[0]))
    
    fair_price1 = round(mid_gbp1 * GBP_TO_EUR, 2)
    fair_price2 = round(mid_gbp2 * GBP_TO_EUR, 2)
    
   
    weights = {
        "performance": 33,
        "value": 33,
        "efficiency": 34,
        "modernity": 0,
        "practicality": 0
    }
    
    if cars.weights:
        weights = {
            "performance": cars.weights.performance,
            "value": cars.weights.value,
            "efficiency": cars.weights.efficiency,
            "modernity": cars.weights.modernity,
            "practicality": cars.weights.practicality
        }
        
       
        total = sum(weights.values())
        if total > 0:
            for k in weights:
                weights[k] = (weights[k] / total) * 100
    
   
    scores1, total1 = calculate_scores(cars.car1, fair_price1, weights)
    scores2, total2 = calculate_scores(cars.car2, fair_price2, weights)
    
   
    if total1 > total2:
        winner = 1
        recommendation = f"{cars.car1.brand.upper()} {cars.car1.model} is a better match for you!"
    elif total2 > total1:
        winner = 2
        recommendation = f"{cars.car2.brand.upper()} {cars.car2.model} is a better match for you!"
    else:
        winner = 0
        recommendation = "Both cars are equally matched for your needs!"
    
    return CompareOutput(
        car1=CarCompareOutput(
            brand=cars.car1.brand,
            model=cars.car1.model,
            year=cars.car1.year,
            mileage=cars.car1.mileage,
            engineSize=cars.car1.engineSize,
            mpg=cars.car1.mpg,
            fuelType=cars.car1.fuelType,
            transmission=cars.car1.transmission,
            fair_price_eur=fair_price1,
            scores=scores1,
            total_score=total1
        ),
        car2=CarCompareOutput(
            brand=cars.car2.brand,
            model=cars.car2.model,
            year=cars.car2.year,
            mileage=cars.car2.mileage,
            engineSize=cars.car2.engineSize,
            mpg=cars.car2.mpg,
            fuelType=cars.car2.fuelType,
            transmission=cars.car2.transmission,
            fair_price_eur=fair_price2,
            scores=scores2,
            total_score=total2
        ),
        winner=winner,
        recommendation=recommendation
    )

@app.get("/vin/{vin}")
def get_vin(vin: str):
    return decode_vin(vin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)