import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

df_encoded = joblib.load('processed/df_encoded.pkl')

X = df_encoded.drop(['name', 'selling_price', 'price_category'], axis=1)
y = df_encoded['price_category']
print(f"[1] X shape: {X.shape}, y shape: {y.shape}")

numeric_features = ['year', 'km_driven', 'mileage(km/ltr/kg)', 'engine', 'max_power', 'seats', 'car_age']
scaler = StandardScaler()
X_scaled = X.copy()
X_scaled[numeric_features] = scaler.fit_transform(X[numeric_features])

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)
print(f"[2] Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

joblib.dump(X_scaled, 'processed/X.pkl')
joblib.dump(y, 'processed/y.pkl')
joblib.dump(X_train, 'processed/X_train.pkl')
joblib.dump(X_test, 'processed/X_test.pkl')
joblib.dump(y_train, 'processed/y_train.pkl')
joblib.dump(y_test, 'processed/y_test.pkl')
joblib.dump(scaler, 'processed/scaler.pkl')
joblib.dump(X.columns.tolist(), 'processed/feature_columns.pkl')
print(f"[3] Ruajtur te gjithe skedaret ne 'processed/'")

