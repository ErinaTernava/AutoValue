import joblib
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score, root_mean_squared_error

X_train = joblib.load("processed/X_train.pkl")
X_test  = joblib.load("processed/X_test.pkl")
y_train = joblib.load("processed/y_train.pkl")
y_test  = joblib.load("processed/y_test.pkl")

print("Training fair price model...")
model_mid = XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=6, random_state=42, n_jobs=-1)
model_mid.fit(X_train, y_train)

print("Training low price model...")
model_low = XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=6, random_state=42, n_jobs=-1, objective="reg:quantileerror", quantile_alpha=0.10)
model_low.fit(X_train, y_train)

print("Training high price model...")
model_high = XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=6, random_state=42, n_jobs=-1, objective="reg:quantileerror", quantile_alpha=0.90)
model_high.fit(X_train, y_train)

preds_real  = np.expm1(model_mid.predict(X_test))
y_test_real = np.expm1(y_test)

rmse = root_mean_squared_error(y_test_real, preds_real)
mae  = mean_absolute_error(y_test_real, preds_real)
r2   = r2_score(y_test_real, preds_real)

print(f"\nFair model — RMSE: £{rmse:,.0f} | MAE: £{mae:,.0f} | R²: {r2:.4f}")

joblib.dump(model_low,  "model/model_low.pkl")
joblib.dump(model_mid,  "model/model_mid.pkl")
joblib.dump(model_high, "model/model_high.pkl")
print("\nSaved model_low.pkl, model_mid.pkl, model_high.pkl")