import { useState } from "react";

export default function App() {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    setResults([]);
  };

  const predictImages = async () => {
    if (images.length === 0) {
      alert("🐾 Upload an image first!");
      return;
    }

    setLoading(true);
    const preds = [];

    for (let img of images) {
      const formData = new FormData();
      formData.append("file", img);

      try {
        const res = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        preds.push(data);
      } catch {
        preds.push({
          result: "❌ Prediction Failed",
          confidence: 0,
          label: "Error",
        });
      }
    }

    setResults(preds);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-[radial-gradient(circle_at_top,_#f9a8d4,_#c084fc,_#60a5fa)]">

      <div className="relative w-full max-w-6xl p-12 rounded-[2.8rem]
        bg-white/20 backdrop-blur-2xl border border-white/30
        shadow-[0_30px_80px_rgba(0,0,0,0.35)]
        transition-all duration-500 hover:-translate-y-2">

        {/* Glow Border */}
        <div className="absolute -inset-1 rounded-[2.8rem]
          bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400
          opacity-60 blur-xl -z-10"></div>

        {/* 🚀 BIG PROJECT HEADING */}
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold
          tracking-widest mb-6 uppercase
          bg-gradient-to-r from-white via-yellow-200 to-white
          bg-clip-text text-transparent drop-shadow-lg">
           AI IMAGE CLASSIFIER (CNN)
        </h1>

        {/* CAT vs DOG HEADER */}
        <div className="relative text-center mb-10">
          <div className="absolute -left-12 -top-6 text-7xl animate-bounce">
            🐱
          </div>
          <div className="absolute -right-12 -top-6 text-7xl animate-bounce delay-200">
            🐶
          </div>

          <h2 className="text-5xl font-extrabold mb-2
            bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
            bg-clip-text text-transparent drop-shadow-lg">
            Cat vs Dog
          </h2>

          <p className="text-white/90 text-lg">
            Upload ANY image • Cute AI decides smartly ✨
          </p>

          <p className="text-white/70 text-sm mt-2">
            
          </p>
        </div>

        {/* Upload */}
        <div className="text-center mb-8">
          <label className="cursor-pointer inline-block">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <div className="px-12 py-5 rounded-full font-extrabold text-xl text-white
              bg-gradient-to-r from-pink-500 to-purple-600
              shadow-[0_15px_40px_rgba(168,85,247,0.6)]
              hover:scale-110 transition-all duration-300">
              📸 Upload Images
            </div>
          </label>
        </div>

        {/* Image Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
            {previews.map((src, i) => (
              <div
                key={i}
                className="rounded-3xl p-4 bg-white/80 backdrop-blur-xl
                shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                transform transition duration-500 hover:-translate-y-4 hover:rotate-1">

                <img
                  src={src}
                  alt="preview"
                  className="h-48 w-full object-cover rounded-2xl
                  border-4 border-pink-300 shadow-md"
                />

                <div className="mt-4 text-center">
                  {results[i] ? (
                    <>
                      <p className="text-2xl font-extrabold">
                        {results[i].result}
                      </p>
                      <p className="text-sm text-gray-700">
                        Confidence: {results[i].confidence}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Model: {results[i].label}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400 font-semibold">
                      🤔 Waiting...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Predict Button */}
        <div className="text-center">
          <button
            onClick={predictImages}
            disabled={loading}
            className="px-20 py-6 rounded-full text-2xl font-extrabold text-white
            bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400
            shadow-[0_20px_60px_rgba(236,72,153,0.7)]
            hover:scale-110 transition-all duration-300 disabled:opacity-50">
            {loading ? "🧠 AI Thinking..." : "✨ Predict Now ✨"}
          </button>
        </div>

        <p className="text-center text-white/70 mt-10 text-sm">
          Powered by ResNet50 • ImageNet • FastAPI • React
        </p>
      </div>
    </div>
  );
}
