import pandas as pd
import os
import joblib

folder = "data"
files = ["audi.csv", "bmw.csv", "merc.csv", "vw.csv",
         "toyota.csv", "skoda.csv", "vauxhall.csv", "ford.csv",
         "hyundi.csv"]

dfs = []
for f in files:
    temp = pd.read_csv(os.path.join(folder, f))
    temp["brand"] = f.replace(".csv", "")
    dfs.append(temp)

df = pd.concat(dfs, ignore_index=True)

df = df.drop(columns=["tax", "tax(£)"])

df = df.dropna(subset=["mpg"])

df = df[df["price"] >= 1000]
df = df[df["price"] <= 100000]


df = df[df["mileage"] >= 100]
df = df[df["mileage"] <= 250000]

df = df[df["year"] >= 1998]
df = df[df["year"] <= 2020]


df = df[df["engineSize"] > 0]
df = df[df["engineSize"] <= 6.0]


df = df[df["fuelType"].isin(["Petrol", "Diesel", "Hybrid", "Electric"])]


df = df[df["transmission"].isin(["Manual", "Automatic", "Semi-Auto"])]


df = df.reset_index(drop=True)

print("Cleaned shape:", df.shape)
print("\nMissing values:")
print(df.isnull().sum())
print("\nPrice stats:")
print(df["price"].describe())
print("\nFuel types:")
print(df["fuelType"].value_counts())
print("\nBrands:")
print(df["brand"].value_counts())

joblib.dump(df, "processed/df_cleaned.pkl")
print("\nSaved to processed/df_cleaned.pkl")

df.to_csv("data/dataCleaned.csv", index=False)
print("Also saved to data/df_cleaned.csv")