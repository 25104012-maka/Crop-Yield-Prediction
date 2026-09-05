import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
import joblib

# -----------------------------
# 1. Load Dataset
# -----------------------------
print("Loading dataset...")

data = pd.read_csv("ml/dataset.csv")

print("Dataset loaded successfully.")
print(data.head())

# -----------------------------
# 2. Separate Input and Output
# -----------------------------
X = data.drop("yield", axis=1)
y = data["yield"]

# -----------------------------
# 3. Define Features
# -----------------------------
categorical_features = ["crop"]

numerical_features = [
    "rainfall",
    "temperature",
    "humidity",
    "soil_ph",
    "nitrogen",
    "phosphorus",
    "potassium",
    "irrigation"
]

# -----------------------------
# 4. Preprocessing
# -----------------------------
preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "num",
            "passthrough",
            numerical_features
        )
    ]
)

# -----------------------------
# 5. Create Machine Learning Model
# -----------------------------
model = Pipeline([
    ("preprocessor", preprocessor),
    (
        "model",
        RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )
    )
])

# -----------------------------
# 6. Split Dataset
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -----------------------------
# 7. Train Model
# -----------------------------
print("Training model...")

model.fit(X_train, y_train)

print("Model trained successfully.")

# -----------------------------
# 8. Check Model Accuracy
# -----------------------------
score = model.score(X_test, y_test)

print("Model R2 Score:", score)

# -----------------------------
# 9. Save Model
# -----------------------------
joblib.dump(model, "ml/model.pkl")

print("Model saved successfully as model.pkl")
print("Training completed!")