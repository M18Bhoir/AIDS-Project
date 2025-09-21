from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import numpy as np
import pickle
import sklearn
import os
from dotenv import load_dotenv

print("scikit-learn version:", sklearn.__version__)

# -------------------------------
# Load environment variables from .env file
# -------------------------------
load_dotenv()

# -------------------------------
# Load ML models
# -------------------------------
dtr = pickle.load(open(r"C:\Users\bhoir\OneDrive\Desktop\AIDS\my-app\src\backend\dtr.pkl", "rb"))
preprocesser = pickle.load(open(r"C:\Users\bhoir\OneDrive\Desktop\AIDS\my-app\src\backend\preprocesser.pkl", "rb"))


# -------------------------------
# Flask app setup
# -------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------
# MySQL setup using environment variables
# -------------------------------
db = mysql.connector.connect(
    host='127.0.0.1',
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_DATABASE")
)
cursor = db.cursor(dictionary=True)

# -------------------------------
# Home route (optional, for testing)
# -------------------------------
@app.route('/')
def index():
    return render_template('index.html')

# -------------------------------
# Signup API
# -------------------------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    userId = data.get("userId")
    password = generate_password_hash(data.get("password"))

    try:
        cursor.execute(
            "INSERT INTO users (username, userId, password) VALUES (%s, %s, %s)",
            (username, userId, password)
        )
        db.commit()
        return jsonify({"message": "User registered successfully!"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400

# -------------------------------
# Login API
# -------------------------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    userId = data.get("userId")
    password = data.get("password")

    cursor.execute("SELECT * FROM users WHERE userId=%s", (userId,))
    user = cursor.fetchone()

    if user and check_password_hash(user["password"], password):
        return jsonify({"message": "Login successful!", "username": user["username"]})
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# -------------------------------
# Prediction API
# -------------------------------
@app.route("/predict", methods=['POST'])
def predict():
    data = request.get_json()

    Year = data.get("Year")
    average_rain_fall_mm_per_year = data.get("average_rain_fall_mm_per_year")
    pesticides_tonnes = data.get("pesticides_tonnes")
    avg_temp = data.get("avg_temp")
    Area = data.get("Area")
    Item = data.get("Item")

    # Prepare features
    features = np.array([[Year, average_rain_fall_mm_per_year,
                          pesticides_tonnes, avg_temp, Area, Item]], dtype=object)

    # Transform and predict
    transformed_features = preprocesser.transform(features)
    prediction = dtr.predict(transformed_features).reshape(1, -1)

    return jsonify({"prediction": float(prediction[0][0])})




# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)