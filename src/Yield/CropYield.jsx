import React, { useState } from "react";
import "./CropYield.css"; 

const CropYield = () => {
  const [formData, setFormData] = useState({
    Year: 2013,
    average_rain_fall_mm_per_year: "",
    pesticides_tonnes: "",
    avg_temp: "",
    Area: "",
    Item: "",
  });

  const [prediction, setPrediction] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="crop-container">
      <div className="crop-wrapper">
        <h1 className="crop-title">Crop Yield Prediction Per Country</h1>
        <div className="crop-box">
          <h2 className="form-title">Input All Features Here</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="Year"
                value={formData.Year}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Average Rainfall (mm/year)</label>
              <input
                type="number"
                name="average_rain_fall_mm_per_year"
                value={formData.average_rain_fall_mm_per_year}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Pesticides (tonnes)</label>
              <input
                type="number"
                name="pesticides_tonnes"
                value={formData.pesticides_tonnes}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Average Temperature (°C)</label>
              <input
                type="number"
                name="avg_temp"
                value={formData.avg_temp}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Area</label>
              <input
                type="text"
                name="Area"
                value={formData.Area}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Item</label>
              <input
                type="text"
                name="Item"
                value={formData.Item}
                onChange={handleChange}
              />
            </div>
            <div className="form-submit">
              <button type="submit" className="btn">
                Predict
              </button>
            </div>
          </form>

          {prediction && (
            <div className="prediction">
              <h2>Predicted Yield:</h2>
              <h3>{prediction}</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropYield;
