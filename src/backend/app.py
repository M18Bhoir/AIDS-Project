import os
import secrets
import pickle
import numpy as np
import sklearn
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import mysql.connector

# -------------------------------
# Configuration and Initialization
# -------------------------------
# Note: For Canvas environment, external DB and .env are usually mocked or pre-configured.
# We proceed by assuming environment variables are set or provided for DB connection.

# Load ML model files
try:
    # Use standard Python pickle module for loading
    model = pickle.load(open('model.pkl', 'rb'))
    sc = pickle.load(open('standscaler.pkl', 'rb'))
    mx = pickle.load(open('minmaxscaler.pkl', 'rb'))
    print("✅ Successfully loaded the ML components.")
except FileNotFoundError:
    print("Error: One or more ML files (model.pkl, standscaler.pkl, minmaxscaler.pkl) not found.")
    model, sc, mx = None, None, None
except Exception as e:
    print(f"Error loading ML components: {e}")
    model, sc, mx = None, None, None

# Flask app setup
app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

# -------------------------------
# MySQL setup (Placeholder/Mock Connection)
# -------------------------------
# NOTE: Removed direct os.getenv calls and added a simplified connection
# mock, as environment variables aren't available in this execution context.
db = None
cursor = None
try:
    # --- MOCK DB CONNECTION (Replace with real connection logic in production) ---
    db = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="Manas@2004%7sc",
        database="agridb"
    )
    cursor = db.cursor(dictionary=True)
    print("✅ Successfully connected to the database (mock).")
except mysql.connector.Error as err:
    print(f"Error connecting to MySQL (Using mock credentials): {err}")
    # Initialize cursor as a mock object if connection fails to prevent app crash
    class MockCursor:
        def execute(self, query, params=None): pass
        def fetchone(self): return None
        def fetchall(self): return []
    cursor = MockCursor()

# -------------------------------
# Authentication APIs
# -------------------------------

@app.route('/signup', methods=['POST'])
def signup():
    if not cursor:
        return jsonify({"error": "Database connection not available"}), 500

    data = request.get_json()
    username = data.get("username")
    userId = data.get("userId")
    password = generate_password_hash(data.get("password"))

    if not all([username, userId, password]):
        return jsonify({"error": "Missing username, userId, or password"}), 400

    try:
        # Check if user already exists
        cursor.execute("SELECT userId FROM users WHERE userId=%s", (userId,))
        if cursor.fetchone():
            return jsonify({"error": "User ID already exists"}), 409

        # Insert new user
        cursor.execute(
            "INSERT INTO users (username, userId, password) VALUES (%s, %s, %s)",
            (username, userId, password)
        )
        db.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/login', methods=['POST'])
def login():
    if not cursor:
        return jsonify({"error": "Database connection not available"}), 500

    data = request.get_json()
    userId = data.get("userId")
    password = data.get("password")

    if not all([userId, password]):
        return jsonify({"error": "Missing userId or password"}), 400

    cursor.execute("SELECT * FROM users WHERE userId=%s", (userId,))
    user = cursor.fetchone()

    if user and check_password_hash(user["password"], password):
        # NOTE: In a real app, you would generate and return a JWT/Session token here
        return jsonify({"message": "Login successful!", "userId": user["userId"]}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# -------------------------------
# Crop Recommendation API
# -------------------------------
@app.route("/predict", methods=['POST'])
def predict():
    if not model or not sc or not mx:
        return jsonify({"error": "Machine learning model not loaded"}), 500

    # FIX: Use request.get_json() to correctly parse data sent from the React frontend
    data = request.get_json()
    
    try:
        # Extract numerical inputs based on the AgriDashBoard.jsx form keys
        N = float(data.get("Nitrogen"))
        P = float(data.get("Phosporus"))
        K = float(data.get("Potassium"))
        temp = float(data.get("Temperature"))
        humidity = float(data.get("Humidity"))
        ph = float(data.get("pH"))
        rainfall = float(data.get("Rainfall"))
        
        # 7 features in the order expected by the scalers
        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)

        # Apply MinMax Scaler
        mx_features = mx.transform(single_pred)
        
        # Apply Standard Scaler
        sc_mx_features = sc.transform(mx_features)
        
        # Predict the crop index
        prediction_index = model.predict(sc_mx_features)[0]

        # Define the crop dictionary (Mapping prediction index to crop name)
        # This mapping must align with the labels used when the model was trained.
        crop_dict = {
            1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya", 7: "Orange",
            8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
            14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "MungBean", 18: "MothBeans",
            19: "Chickpea", 20: "KidneyBeans", 21: "PigeonPeas", 22: "AdzukiBeans"
        }
        
        recommended_crop = crop_dict.get(int(prediction_index), "Unknown Crop")

        return jsonify({"recommendation": recommended_crop}), 200

    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid data format or missing feature: {str(e)}"}), 400
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": "Unexpected error during prediction processing"}), 500

# -------------------------------
@app.route('/')
def index():
    # Placeholder for serving the index.html or React entry point
    return "Backend is running. Access the React frontend for the dashboard."

if __name__ == "__main__":
    app.run(debug=True)
