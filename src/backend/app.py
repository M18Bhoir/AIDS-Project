import os
import secrets
import pickle
import numpy as np
import sklearn
import mysql.connector
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import joblib
import pandas as pd

print("scikit-learn version:", sklearn.__version__)

# -------------------------------
# Load environment variables from .env file
# -------------------------------
load_dotenv()

# -------------------------------
# Load ML model pipeline
# -------------------------------
# Get the absolute path to the directory where the script is located
base_dir = os.path.dirname(os.path.abspath(__file__))
pipeline_path = os.path.join(base_dir, "dtr_pipeline.pkl")

try:
    with open(pipeline_path, "rb") as pipeline_file:
        pipeline = joblib.load(pipeline_file)
    print("✅ Successfully loaded the prediction pipeline.")
except FileNotFoundError:
    print("Error: Pipeline file not found. Ensure dtr_pipeline.pkl is in the same directory as the script.")
    pipeline = None

# -------------------------------
# Flask app setup
# -------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------
# MySQL setup using environment variables
# -------------------------------
db = None
cursor = None
try:
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_DATABASE")
    )
    cursor = db.cursor(dictionary=True)
    print("✅ Successfully connected to the database.")
except mysql.connector.Error as err:
    print(f"Error connecting to MySQL: {err}")

# -------------------------------
# Signup API
# -------------------------------
@app.route('/signup', methods=['POST'])
def signup():
    if not db:
        return jsonify({"error": "Database connection not available"}), 500

    data = request.get_json()
    username = data.get("username")
    userId = data.get("userId")
    password = generate_password_hash(data.get("password"))

    if not username or not userId or not password:
        return jsonify({"error": "Missing username, userId, or password"}), 400

    try:
        cursor.execute("SELECT userId FROM users WHERE userId=%s", (userId,))
        if cursor.fetchone():
            return jsonify({"error": "User ID already exists"}), 409

        cursor.execute(
            "INSERT INTO users (username, userId, password) VALUES (%s, %s, %s)",
            (username, userId, password)
        )
        db.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# -------------------------------
# Login API
# -------------------------------
@app.route('/login', methods=['POST'])
def login():
    if not db:
        return jsonify({"error": "Database connection not available"}), 500

    data = request.get_json()
    userId = data.get("userId")
    password = data.get("password")

    if not userId or not password:
        return jsonify({"error": "Missing userId or password"}), 400

    cursor.execute("SELECT * FROM users WHERE userId=%s", (userId,))
    user = cursor.fetchone()

    if user and check_password_hash(user["password"], password):
        return jsonify({"message": "Login successful!", "username": user["username"]}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401



# -------------------------------
# Prediction API
# -------------------------------
@app.route("/predict", methods=['POST'])
def predict():
    if not pipeline:
        return jsonify({"error": "Machine learning model not loaded"}), 500

    data = request.get_json()

    try:
        # Extract numerical inputs
        Year = float(data.get("Year"))
        average_rain_fall_mm_per_year = float(
            data.get("AverageRainfall") or data.get("average_rain_fall_mm_per_year")
        )
        pesticides_tonnes = float(
            data.get("Pesticides") or data.get("pesticides_tonnes")
        )
        avg_temp = float(
            data.get("AverageTemperature") or data.get("avg_temp")
        )

        # Extract categorical inputs
        Area = str(data.get("Area"))
        Item = str(data.get("Item"))

        if not Area or not Item:
            return jsonify({"error": "Missing Area or Item"}), 400

        # 👇 Build a DataFrame with the exact column names used during training
        features = pd.DataFrame([{
            "Year": Year,
            "average_rain_fall_mm_per_year": average_rain_fall_mm_per_year,
            "pesticides_tonnes": pesticides_tonnes,
            "avg_temp": avg_temp,
            "Area": Area,
            "Item": Item
        }])

        # Predict
        prediction = pipeline.predict(features)[0]

        return jsonify({"prediction": float(prediction)}), 200

    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": "Unexpected error during prediction"}), 500
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)
