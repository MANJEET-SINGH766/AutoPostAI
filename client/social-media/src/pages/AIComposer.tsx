import { useState } from "react";
import { Sparkles, ArrowRight, History } from "lucide-react";
import { dummyGenerationData } from "../assets/assets";

const tones = [
  "Professional",
  "Creative",
  "Funny",
  "Minimalist",
  "Excited",
];

const stats = [
  { title: "Generated Today", value: 12 },
  { title: "Images Created", value: 8 },
  { title: "Posts Scheduled", value: 24 },
];

const AIComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [aiImage, setAiImage] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Composer</h1>
        <p className="text-gray-500">
          Manage and automate your social presence
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white p-5 rounded-2xl border shadow-sm"
          >
            <p className="text-gray-500 text-sm">{item.title}</p>
            <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
        <h2 className="text-4xl font-semibold text-center mb-10">
          What should we create today?
        </h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Share your idea... (e.g. Create a LinkedIn post about AI internship opportunities)"
          className="w-full h-40 border rounded-2xl p-5 resize-none outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-5">
          <div className="flex items-center gap-3">
            <span className="font-medium">AI Image</span>

            <button
              onClick={() => setAiImage(!aiImage)}
              className={`w-14 h-8 rounded-full relative transition ${
                aiImage ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
                  aiImage ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition">
            <Sparkles size={18} />
            Generate
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Tones */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {tones.map((item) => (
            <button
              key={item}
              onClick={() => setTone(item)}
              className={`px-5 py-2 rounded-full border transition ${
                tone === item
                  ? "bg-red-500 text-white border-red-500"
                  : "hover:bg-red-50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Generations */}
      <div className="flex justify-between items-center mt-14 mb-6">
        <div className="flex items-center gap-2">
          <History size={20} />
          <h3 className="text-2xl font-semibold">
            Recent Generations
          </h3>
        </div>

        <span className="text-gray-500">
          {dummyGenerationData.length} total
        </span>
      </div>

      {/* Cards */}
<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
  {dummyGenerationData.map((item: any) => (
    <div
      key={item._id}
      className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
    >
      {item.mediaUrl && (
        <img
          src={item.mediaUrl}
          alt=""
          className="w-full h-52 object-cover"
        />
      )}

      <div className="p-5">
        <div className="flex justify-between mb-3">
          <span className="text-xs text-gray-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>

          <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full">
            {item.tone}
          </span>
        </div>

        <p className="text-gray-700 line-clamp-4 mb-4">
          {item.content}
        </p>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Schedule this post
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
            />

            <input
              type="time"
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            className="
              w-full
              mt-4
              bg-gradient-to-r
              from-red-500
              to-pink-500
              text-white
              py-3
              rounded-xl
              font-medium
              hover:scale-105
              transition
            "
          >
            🚀 Schedule Post
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
    </div>
  );
};

export default AIComposer;