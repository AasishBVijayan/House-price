import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
import joblib
from sklearn.metrics import mean_squared_error, r2_score

# 1. Load Data & Select Features
df = pd.read_csv("AmesHousing.csv")
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

# 2. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. Define Monotonic Constraints for XGBoost
# 1 means strictly increasing (as the feature goes up, price goes up)
# We map this to our 6 features in exact order.
constraints = (1, 1, 1, 1, 1, 1)

# 4. Initialize and Train the XGBoost Model
# We use a slightly lower learning rate with more estimators for better accuracy
model = XGBRegressor(
    n_estimators=150,       # Reduced from 500
    learning_rate=0.1,      # Increased slightly for faster convergence
    max_depth=3,            # Reduced from 5 (keeps the decision trees simple)
    monotone_constraints=constraints,
    random_state=42
)

print("Training XGBoost model...")
model.fit(X_train, y_train)

# 5. Evaluate the Model
y_pred_log = model.predict(X_test)
y_pred = np.expm1(y_pred_log)
y_true = np.expm1(y_test)

rmse = np.sqrt(mean_squared_error(y_true, y_pred))
r2 = r2_score(y_true, y_pred)

print(f"✅ XGBoost RMSE: ${rmse:,.2f}")
print(f"✅ XGBoost R2 Score: {r2:.4f}")

# 6. Save the new XGBoost model
joblib.dump(model, "house_price_pipeline.pkl")
print("Model saved successfully as house_price_pipeline.pkl!")