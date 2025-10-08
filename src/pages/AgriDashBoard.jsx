// src/pages/AgriDashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../App";
import CropRecommendation from "../components/CropRecommendation";
import SoilAnalysis from "../components/SoilAnalysis";
import WeatherWidget from "../components/WeatherWidget";
import ImageAssessment from "../components/ImageAssessment";

const AgriDashboard = () => {
  const { logoutUser, userId } = useAuth();
  const [tab, setTab] = useState("crop");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">🌾 AgriSmart Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">Welcome, {userId}</span>
          <button
            onClick={logoutUser}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { id: "crop", label: "Crop Recommendation" },
          { id: "soil", label: "Soil Analysis" },
          { id: "weather", label: "Weather" },
          { id: "image", label: "Image Assessment" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === t.id
                ? "bg-green-600 text-white shadow-md"
                : "bg-white hover:bg-green-50 border"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-xl rounded-xl p-6">
        {tab === "crop" && <CropRecommendation />}
        {tab === "soil" && <SoilAnalysis />}
        {tab === "weather" && <WeatherWidget />}
        {tab === "image" && <ImageAssessment />}
      </div>
    </div>
  );
};

export default AgriDashboard;
