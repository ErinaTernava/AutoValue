import pandas as pd
import joblib

df = joblib.load('processed/df_with_car_age.pkl')

q33 = df['selling_price'].quantile(0.33)
q67 = df['selling_price'].quantile(0.67)

df['price_category'] = 0
df.loc[(df['selling_price'] > q33) & (df['selling_price'] <= q67), 'price_category'] = 1
df.loc[df['selling_price'] > q67, 'price_category'] = 2

print(f"[1] Klasat: 0={sum(df['price_category']==0)}, 1={sum(df['price_category']==1)}, 2={sum(df['price_category']==2)}")

joblib.dump(df, 'processed/df_with_target.pkl')
print(f"[2] Ruajtur: processed/df_with_target.pkl")


