// src/components/CropRecommendation.jsx
import React, { useState } from "react";

const CropRecommendation = () => {
  const [form, setForm] = useState({
    Nitrogen: "",
    Phosporus: "",
    Potassium: "",
    Temperature: "",
    Humidity: "",
    pH: "",
    Rainfall: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.recommendation || "No recommendation found");
      } else {
        setResult(data.error || "Error predicting crop");
      }
    } catch (err) {
      setResult("Failed to connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-green-700 mb-4">
        🌿 Crop Recommendation
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {Object.keys(form).map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field}
            required
            className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        ))}

        <div className="col-span-full flex gap-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
          >
            {loading ? "Predicting..." : "Get Recommendation"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm({
                Nitrogen: "",
                Phosporus: "",
                Potassium: "",
                Temperature: "",
                Humidity: "",
                pH: "",
                Rainfall: "",
              });
              setResult(null);
            }}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-5 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
          <p className="text-green-800 text-lg font-medium">
            Recommended Crop: <span className="font-bold">{result}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;
