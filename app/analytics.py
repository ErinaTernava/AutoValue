import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter
from sklearn.cluster import KMeans

router = APIRouter()


df = joblib.load("processed/df_cleaned.pkl")


@router.get("/analytics/brands")
def brand_distribution():
    return df["brand"].value_counts().to_dict()


@router.get("/analytics/transmissions")
def transmission_distribution():
    return df["transmission"].value_counts().to_dict()


@router.get("/analytics/fuel-types")
def fuel_distribution():
    return df["fuelType"].value_counts().to_dict()


@router.get("/analytics/mileage")
def mileage_distribution():
    bins = [0, 30000, 80000, 150000, 250000]
    labels = ["Low", "Medium", "High", "Very High"]

    df_copy = df.copy()
    df_copy["mileage_group"] = pd.cut(df_copy["mileage"], bins=bins, labels=labels)

    return df_copy["mileage_group"].value_counts().to_dict()


@router.get("/analytics/clusters")
def clustering():

    X = df[["mileage", "engineSize", "mpg"]].copy()

    model = KMeans(n_clusters=3, random_state=42)
    clusters = model.fit_predict(X)

    df_copy = df.copy()
    df_copy["cluster"] = clusters

    return {
        "cluster_counts": df_copy["cluster"].value_counts().to_dict()
    }