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
# -------------------------------
# Prediction API
# -------------------------------
@app.route("/predict", methods=['POST'])
def predict():
    if not pipeline:
        return jsonify({"error": "Machine learning model not loaded"}), 500

    data = request.get_json()

    # Define the fields and their required types
    fields_to_check = {
        "Year": float,
        "average_rain_fall_mm_per_year": float,
        "pesticides_tonnes": float,
        "avg_temp": float,
        "Area": str,
        "Item": str
    }

    # Prepare features, converting empty strings to None for validation
    features_dict = {}
    for field, type_hint in fields_to_check.items():
        value = data.get(field)
        if value == "":
            features_dict[field] = None
        else:
            features_dict[field] = value

    # Validate for missing or empty fields
    if any(features_dict[field] is None for field in fields_to_check):
        return jsonify({"error": "Missing one or more required fields"}), 400

    try:
        # Prepare features for prediction with proper data types
        features = np.array([[
            float(features_dict["Year"]),
            float(features_dict["average_rain_fall_mm_per_year"]),
            float(features_dict["pesticides_tonnes"]),
            float(features_dict["avg_temp"]),
            features_dict["Area"],
            features_dict["Item"]
        ]])

        # Predict using the loaded pipeline
        prediction = pipeline.predict(features)[0]

        # Return the prediction as a JSON response
        return jsonify({"prediction": float(prediction)}), 200

    except ValueError:
        return jsonify({"error": "Invalid data format. Please ensure all numerical inputs are valid numbers."}), 400
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": "An unexpected error occurred during prediction."}), 500
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)
