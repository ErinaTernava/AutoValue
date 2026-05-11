import pandas as pd
import numpy as np
import joblib
import os

os.makedirs('processed', exist_ok=True)


df = pd.read_csv('data/cars.csv')
print(f"[1] Dataseti: {df.shape[0]} rreshta, {df.shape[1]} kolona")

numeric_cols = ['mileage(km/ltr/kg)', 'engine', 'max_power', 'seats']
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

for col in numeric_cols:
    df[col] = df.groupby('fuel')[col].transform(lambda x: x.fillna(x.median()))
    df[col] = df[col].fillna(df[col].median())

categorical_cols = ['name', 'fuel', 'seller_type', 'transmission', 'owner']
for col in categorical_cols:
    df[col] = df[col].fillna(df[col].mode()[0] if len(df[col].mode()) > 0 else 'Unknown')

print(f"[2] Missing values: {df.isnull().sum().sum()}")

joblib.dump(df, 'processed/df_cleaned.pkl')
print(f"[3] Ruajtur: processed/df_cleaned.pkl")

