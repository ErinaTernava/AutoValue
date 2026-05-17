import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

X_train = joblib.load('processed/X_train.pkl')
X_test = joblib.load('processed/X_test.pkl')
y_train = joblib.load('processed/y_train.pkl')
y_test = joblib.load('processed/y_test.pkl')
df_encoded = joblib.load('processed/df_encoded.pkl')
scaler = joblib.load('processed/scaler.pkl')
feature_columns = joblib.load('processed/feature_columns.pkl')

X_train.to_csv('X_train.csv', index=False)
X_test.to_csv('X_test.csv', index=False)
y_train.to_csv('y_train.csv', index=False)
y_test.to_csv('y_test.csv', index=False)
df_encoded.to_csv('cleaned_dataset.csv', index=False)
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(feature_columns, 'feature_columns.pkl')
print(f"[1] CSV-të u ruajtën")

plt.figure(figsize=(8,5))
sns.countplot(x=y_train, palette='viridis')
plt.title('Shpërndarja e price_category', fontsize=12)
plt.xlabel('Price Category (0=Ulët, 1=Mesatar, 2=Lartë)')
plt.ylabel('Numri i makinave')
plt.savefig('class_distribution.png', dpi=100, bbox_inches='tight')
print(f"[2] Grafiku u ruajt")


print(f"Dataseti origjinal: 8128 rreshta, 12 kolona")
print(f"Dataseti pas preprocessing: {df_encoded.shape[0]} rreshta, {df_encoded.shape[1]} kolona")
print(f"\nShpërndarja e klasave:")
print(f"  Klasa 0 (çmim i ulët):   {sum(y_train==0)} ({sum(y_train==0)/len(y_train)*100:.1f}%)")
print(f"  Klasa 1 (çmim mesatar): {sum(y_train==1)} ({sum(y_train==1)/len(y_train)*100:.1f}%)")
print(f"  Klasa 2 (çmim i lartë):  {sum(y_train==2)} ({sum(y_train==2)/len(y_train)*100:.1f}%)")
print(f"\nNumri i tipareve: {X_train.shape[1]}")
print(f"Train/Test split: {X_train.shape[0]}/{X_test.shape[0]} samples")


print("  - X_train.csv")
print("  - X_test.csv")
print("  - y_train.csv")
print("  - y_test.csv")
print("  - cleaned_dataset.csv")
print("  - scaler.pkl")
print("  - feature_columns.pkl")
print("  - class_distribution.png")

