import pandas as pd
import joblib

df = joblib.load('processed/df_cleaned.pkl')

df['car_age'] = 2026 - df['year']
print(f"[1] car_age: min={df['car_age'].min()}, max={df['car_age'].max()}")

joblib.dump(df, 'processed/df_with_car_age.pkl')
print(f"[2] Ruajtur: processed/df_with_car_age.pkl")
