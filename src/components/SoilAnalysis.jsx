// src/components/SoilAnalysis.jsx
import React, { useState } from "react";

const SoilAnalysis = () => {
  const [soil, setSoil] = useState({
    Nitrogen: "",
    Phosporus: "",
    Potassium: "",
    pH: "",
  });
  const [advice, setAdvice] = useState(null);

  const analyzeSoil = () => {
    const N = parseFloat(soil.Nitrogen) || 0;
    const P = parseFloat(soil.Phosporus) || 0;
    const K = parseFloat(soil.Potassium) || 0;
    const ph = parseFloat(soil.pH) || 7;
    const rec = [];

    if (N < 50) rec.push("Add nitrogen-rich fertilizers like urea.");
    if (P < 20) rec.push("Use phosphorus fertilizer (superphosphate).");
    if (K < 120) rec.push("Apply potassium fertilizers (muriate of potash).");
    if (ph < 5.5) rec.push("Soil is acidic — apply lime.");
    if (ph > 7.5) rec.push("Soil is alkaline — add sulfur or organic matter.");
    if (rec.length === 0) rec.push("Soil is balanced. Maintain good practices.");

    setAdvice(rec);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-green-700 mb-4">🧪 Soil Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(soil).map((field) => (
          <input
            key={field}
            name={field}
            value={soil[field]}
            onChange={(e) => setSoil({ ...soil, [field]: e.target.value })}
            placeholder={field}
            className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
        ))}
      </div>
      <button
        onClick={analyzeSoil}
        className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Analyze Soil
      </button>

      {advice && (
        <ul className="mt-5 bg-green-50 p-4 rounded-lg border-l-4 border-green-500 list-disc pl-6">
          {advice.map((item, i) => (
            <li key={i} className="text-green-800">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SoilAnalysis;
