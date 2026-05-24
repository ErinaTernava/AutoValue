import joblib
import pandas as pd
from fastapi import APIRouter, Query
from sklearn.cluster import KMeans
from typing import Optional

router = APIRouter()

df = joblib.load("processed/df_cleaned.pkl")

def filter_df(brand: Optional[str] = None, year_min: Optional[int] = None, 
              year_max: Optional[int] = None, price_min: Optional[float] = None, 
              price_max: Optional[float] = None):
    filtered = df.copy()
    if brand and brand != "all":
        filtered = filtered[filtered["brand"].str.lower() == brand.lower()]
    if year_min:
        filtered = filtered[filtered["year"] >= year_min]
    if year_max:
        filtered = filtered[filtered["year"] <= year_max]
    if price_min:
        filtered = filtered[filtered["price"] >= price_min]
    if price_max:
        filtered = filtered[filtered["price"] <= price_max]
    return filtered

@router.get("/analytics/brands")
def brand_distribution(year_min: Optional[int] = Query(default=None),
                       year_max: Optional[int] = Query(default=None),
                       price_min: Optional[float] = Query(default=None),
                       price_max: Optional[float] = Query(default=None)):
    return filter_df(None, year_min, year_max, price_min, price_max)["brand"].value_counts().to_dict()

@router.get("/analytics/transmissions")
def transmission_distribution(brand: Optional[str] = Query(default=None),
                               year_min: Optional[int] = Query(default=None),
                               year_max: Optional[int] = Query(default=None),
                               price_min: Optional[float] = Query(default=None),
                               price_max: Optional[float] = Query(default=None)):
    return filter_df(brand, year_min, year_max, price_min, price_max)["transmission"].value_counts().to_dict()

@router.get("/analytics/fuel-types")
def fuel_distribution(brand: Optional[str] = Query(default=None),
                      year_min: Optional[int] = Query(default=None),
                      year_max: Optional[int] = Query(default=None),
                      price_min: Optional[float] = Query(default=None),
                      price_max: Optional[float] = Query(default=None)):
    return filter_df(brand, year_min, year_max, price_min, price_max)["fuelType"].value_counts().to_dict()

@router.get("/analytics/mileage")
def mileage_distribution(brand: Optional[str] = Query(default=None),
                         year_min: Optional[int] = Query(default=None),
                         year_max: Optional[int] = Query(default=None),
                         price_min: Optional[float] = Query(default=None),
                         price_max: Optional[float] = Query(default=None)):
    bins = [0, 30000, 80000, 150000, 250000]
    labels = ["Low", "Medium", "High", "Very High"]
    df_copy = filter_df(brand, year_min, year_max, price_min, price_max).copy()
    df_copy["mileage_group"] = pd.cut(df_copy["mileage"], bins=bins, labels=labels)
    return df_copy["mileage_group"].value_counts().to_dict()

@router.get("/analytics/clusters")
def clustering(brand: Optional[str] = Query(default=None),
               year_min: Optional[int] = Query(default=None),
               year_max: Optional[int] = Query(default=None),
               price_min: Optional[float] = Query(default=None),
               price_max: Optional[float] = Query(default=None)):
    filtered = filter_df(brand, year_min, year_max, price_min, price_max)
    X = filtered[["mileage", "engineSize", "mpg"]].copy()
    n = min(3, len(X))
    model = KMeans(n_clusters=n, random_state=42)
    clusters = model.fit_predict(X)
    df_copy = filtered.copy()
    df_copy["cluster"] = clusters
    return {"cluster_counts": df_copy["cluster"].value_counts().to_dict()}