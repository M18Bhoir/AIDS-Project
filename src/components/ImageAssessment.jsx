// src/components/ImageAssessment.jsx
import React, { useState } from "react";

const ImageAssessment = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/assess-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) setResult(data);
      else setResult({ error: data.error });
    } catch (err) {
      setResult({ error: "Failed to upload or process the image." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-green-700 mb-4">
        📸 Image-Based Crop Quality
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0])}
        className="mb-3 block w-full text-sm text-gray-700"
      />

      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
      >
        {loading ? "Analyzing..." : "Upload & Assess"}
      </button>

      {result && (
        <div className="mt-5 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p>Quality: <strong>{result.quality || "N/A"}</strong></p>
              <p>Price Suggestion: <strong>₹{result.price_suggestion || "N/A"}</strong></p>
              {result.confidence && <p>Confidence: {Math.round(result.confidence * 100)}%</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageAssessment;
