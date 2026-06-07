import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

df = joblib.load("processed/df_cleaned.pkl")

df['car_age'] = df['year'].max() - df['year'] 
df = df.drop(columns=["year"])

df["mileage"] = np.log1p(df["mileage"])
df["price"]   = np.log1p(df["price"])

df = pd.get_dummies(df, columns=["brand", "model", "fuelType", "transmission"], drop_first=False)

print("Shape after encoding:", df.shape)

X = df.drop(columns=["price"])
y = df["price"]

num_cols = ["mileage", "engineSize", "mpg", "car_age"]
scaler = StandardScaler()
X[num_cols] = scaler.fit_transform(X[num_cols])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

joblib.dump(X_train, "processed/X_train.pkl")
joblib.dump(X_test,  "processed/X_test.pkl")
joblib.dump(y_train, "processed/y_train.pkl")
joblib.dump(y_test,  "processed/y_test.pkl")
joblib.dump(scaler,  "processed/scaler.pkl")
joblib.dump(X.columns.tolist(), "processed/feature_columns.pkl")

print("X_train shape:", X_train.shape)
print("Sample prices (£):", np.expm1(y_train.head()))
print("\nAll saved to processed/")