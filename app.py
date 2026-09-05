from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib
import os

# Import soil analysis function
from soil_analysis import analyze_soil_image

app = Flask(__name__)

# --------------------------------------------------
# LOAD TRAINED MODEL
# --------------------------------------------------

MODEL_PATH = "ml/model.pkl"

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    model = None
    print("Error loading model:", e)


# --------------------------------------------------
# HOME PAGE
# --------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# --------------------------------------------------
# CROP YIELD PREDICTION
# --------------------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        # Create dataframe
        input_data = pd.DataFrame([{
            "crop": data["crop"],
            "rainfall": float(data["rainfall"]),
            "temperature": float(data["temperature"]),
            "humidity": float(data["humidity"]),
            "soil_ph": float(data["soil_ph"]),
            "nitrogen": float(data["nitrogen"]),
            "phosphorus": float(data["phosphorus"]),
            "potassium": float(data["potassium"]),
            "irrigation": float(data["irrigation"])
        }])

        if model is None:
            return jsonify({
                "error": "ML model is not loaded."
            }), 500

        # Prediction
        prediction = model.predict(input_data)[0]

        # Risk classification
        if prediction >= 4:
            risk = "Low Risk"
        elif prediction >= 3:
            risk = "Medium Risk"
        else:
            risk = "High Risk"

        return jsonify({
            "yield": round(float(prediction), 2),
            "risk": risk
        })

    except Exception as e:

        print("Prediction error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# --------------------------------------------------
# SOIL IMAGE ANALYSIS
# --------------------------------------------------

@app.route("/analyze_soil", methods=["POST"])
def analyze_soil():

    try:

        # Check image
        if "soilImage" not in request.files:
            return jsonify({
                "error": "No soil image uploaded."
            }), 400

        image = request.files["soilImage"]

        if image.filename == "":
            return jsonify({
                "error": "Please select a soil image."
            }), 400

        # Create upload folder
        upload_folder = "uploads"

        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        # Save image
        image_path = os.path.join(
            upload_folder,
            image.filename
        )

        image.save(image_path)

        # Analyze soil image
        result = analyze_soil_image(image_path)

        if result is None:
            return jsonify({
                "error": "Unable to analyze the soil image."
            }), 500

        # Return soil information
        return jsonify({

            "condition": result["condition"],

            "soil_type": result["soil_type"],

            "moisture": result["moisture"],

            "nitrogen": result["nitrogen"],

            "phosphorus": result["phosphorus"],

            "potassium": result["potassium"],

            "ph": result["ph"]

        })

    except Exception as e:

        print("Soil analysis error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# --------------------------------------------------
# EXPLAINABLE AI - SHAP
# --------------------------------------------------

@app.route("/explain", methods=["POST"])
def explain():

    try:

        import shap

        data = request.get_json()

        input_data = pd.DataFrame([{
            "crop": data["crop"],
            "rainfall": float(data["rainfall"]),
            "temperature": float(data["temperature"]),
            "humidity": float(data["humidity"]),
            "soil_ph": float(data["soil_ph"]),
            "nitrogen": float(data["nitrogen"]),
            "phosphorus": float(data["phosphorus"]),
            "potassium": float(data["potassium"]),
            "irrigation": float(data["irrigation"])
        }])

        if model is None:
            return jsonify({
                "error": "ML model is not loaded."
            }), 500

        # Check whether model is a pipeline
        if hasattr(model, "named_steps"):

            preprocessor = model.named_steps["preprocessor"]
            ml_model = model.named_steps["model"]

            transformed_data = preprocessor.transform(
                input_data
            )

            explainer = shap.TreeExplainer(
                ml_model
            )

            shap_values = explainer.shap_values(
                transformed_data
            )

            # Get feature names
            try:
                feature_names = (
                    preprocessor
                    .get_feature_names_out()
                )
            except:
                feature_names = [
                    "crop",
                    "rainfall",
                    "temperature",
                    "humidity",
                    "soil_ph",
                    "nitrogen",
                    "phosphorus",
                    "potassium",
                    "irrigation"
                ]

            # Handle SHAP output
            if isinstance(shap_values, list):
                values = shap_values[0][0]
            else:
                values = shap_values[0]

            explanation = []

            for name, value in zip(
                feature_names,
                values
            ):
                explanation.append({
                    "feature": str(name),
                    "impact": round(
                        float(value), 4
                    )
                })

            # Sort by absolute impact
            explanation.sort(
                key=lambda x: abs(x["impact"]),
                reverse=True
            )

            return jsonify({
                "explanations": explanation[:5]
            })

        else:

            return jsonify({
                "error":
                "SHAP explanation requires a pipeline model."
            }), 400

    except Exception as e:

        print("SHAP error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# --------------------------------------------------
# WHAT-IF SIMULATION
# --------------------------------------------------

@app.route("/simulate", methods=["POST"])
def simulate():

    try:

        data = request.get_json()

        input_data = pd.DataFrame([{
            "crop": data["crop"],
            "rainfall": float(data["rainfall"]),
            "temperature": float(data["temperature"]),
            "humidity": float(data["humidity"]),
            "soil_ph": float(data["soil_ph"]),
            "nitrogen": float(data["nitrogen"]),
            "phosphorus": float(data["phosphorus"]),
            "potassium": float(data["potassium"]),
            "irrigation": float(data["irrigation"])
        }])

        if model is None:
            return jsonify({
                "error": "ML model is not loaded."
            }), 500

        prediction = model.predict(
            input_data
        )[0]

        return jsonify({
            "yield": round(
                float(prediction), 2
            )
        })

    except Exception as e:

        print("Simulation error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# --------------------------------------------------
# FARM OPTIMIZATION
# --------------------------------------------------

@app.route("/optimize", methods=["POST"])
def optimize():

    try:

        data = request.get_json()

        if model is None:
            return jsonify({
                "error": "ML model is not loaded."
            }), 500

        best_yield = -1

        best_values = {}

        # Test different nitrogen levels
        nitrogen_values = [
            60, 70, 80, 90
        ]

        # Test different irrigation levels
        irrigation_values = [
            60, 70, 80, 90
        ]

        # Test different rainfall conditions
        rainfall_values = [
            500, 600, 700, 800, 900
        ]

        for nitrogen in nitrogen_values:

            for irrigation in irrigation_values:

                for rainfall in rainfall_values:

                    input_data = pd.DataFrame([{

                        "crop": data["crop"],

                        "rainfall": rainfall,

                        "temperature":
                        float(data["temperature"]),

                        "humidity":
                        float(data["humidity"]),

                        "soil_ph":
                        float(data["soil_ph"]),

                        "nitrogen":
                        nitrogen,

                        "phosphorus":
                        float(data["phosphorus"]),

                        "potassium":
                        float(data["potassium"]),

                        "irrigation":
                        irrigation

                    }])

                    prediction = model.predict(
                        input_data
                    )[0]

                    if prediction > best_yield:

                        best_yield = prediction

                        best_values = {

                            "nitrogen":
                            nitrogen,

                            "irrigation":
                            irrigation,

                            "rainfall":
                            rainfall
                        }

        return jsonify({

            "best_yield":
            round(float(best_yield), 2),

            "nitrogen":
            best_values["nitrogen"],

            "irrigation":
            best_values["irrigation"],

            "rainfall":
            best_values["rainfall"]

        })

    except Exception as e:

        print("Optimization error:", e)

        return jsonify({
            "error": str(e)
        }), 500


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )