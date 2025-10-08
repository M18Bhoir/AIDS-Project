// src/components/WeatherWidget.jsx
import React, { useState } from "react";

const WeatherWidget = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    setError("");
    setWeather(null);

    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setError("Please set VITE_OPENWEATHER_API_KEY in your .env file");
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city || "Delhi"}&appid=${apiKey}&units=metric`
      );
      const data = await res.json();
      if (res.ok) {
        setWeather(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch weather data.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-green-700 mb-4">🌤 Weather Data</h2>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Enter City Name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full focus:ring-green-500 focus:border-green-500"
        />
        <button
          onClick={fetchWeather}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Get Weather
        </button>
      </div>

      {error && <p className="text-red-500 font-medium">{error}</p>}

      {weather && (
        <div className="bg-green-50 p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-lg font-semibold">{weather.name}</p>
          <p>{weather.weather?.[0]?.main} — {weather.weather?.[0]?.description}</p>
          <p>🌡 Temperature: {weather.main.temp}°C</p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
          <p>🌬 Wind Speed: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
