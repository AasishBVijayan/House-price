import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import joblib

# 1. Load Data
df = pd.read_csv("AmesHousing.csv")

# 2. SELECT ONLY THE FRONTEND FEATURES
# Note: Ensure these strings exactly match the column names in your CSV
features = [
    "Overall Qual", 
    "Gr Liv Area", 
    "Garage Cars", 
    "Total Bsmt SF", 
    "Full Bath", 
    "Year Built"
]

X = df[features]
y = np.log1p(df["SalePrice"])

# 3. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 4. Simplified Preprocessor
# Since all 6 of our selected features are numerical, we only need the numeric pipeline.
# The median imputer will safely handle any missing garage or basement data
preprocessor = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler())
])

# 5. Upgraded Model Pipeline
# Swapped LinearRegression for RandomForestRegressor for better accuracy
model = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
])

# 6. Train the Model
model.fit(X_train, y_train)

# 7. Evaluate
from sklearn.metrics import mean_squared_error, r2_score

y_pred_log = model.predict(X_test)
y_pred = np.expm1(y_pred_log)
y_true = np.expm1(y_test)

rmse = np.sqrt(mean_squared_error(y_true, y_pred))
r2 = r2_score(y_true, y_pred)

print(f"RMSE: ${rmse:,.2f}")
print(f"R2 Score: {r2:.4f}")

# 8. Save the synchronized model
joblib.dump(model, "house_price_pipeline.pkl")