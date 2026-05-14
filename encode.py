import pandas as pd
import joblib

df = joblib.load('processed/df_with_target.pkl')

df_encoded = pd.get_dummies(df, columns=['fuel', 'seller_type', 'transmission', 'owner'], drop_first=False)
print(f"[1] Encoding: {df_encoded.shape[1]} kolona")

joblib.dump(df_encoded, 'processed/df_encoded.pkl')
print(f"[2] Ruajtur: processed/df_encoded.pkl")
