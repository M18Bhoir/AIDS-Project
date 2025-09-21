// src/Home/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1>
        Crop Yield Prediction using Machine Learning
      </h1>
      <div className="flex gap-6">
        <button
          onClick={() => navigate("/login")}
          className="btn"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="btn"
        >
          Signup
        </button>
      </div>
    </div>
  );
};

export default LandingPage;