import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent text-center">
        Crop Yield Prediction using Machine Learning
      </h1>
      <div className="flex gap-6">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition duration-300 shadow-lg"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition duration-300 shadow-lg"
        >
          Signup
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
