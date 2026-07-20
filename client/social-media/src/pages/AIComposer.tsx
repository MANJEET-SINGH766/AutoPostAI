import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, History, Loader2 } from "lucide-react";
import { dummyGenerationData } from "../assets/assets";
import { api } from "../services/api";

const tones = [
  "Professional",
  "Creative",
  "Funny",
  "Minimalist",
  "Excited",
];

export default function AIComposer() {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [aiImage, setAiImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Track selected date, time, and target account per card ID
  const [inputs, setInputs] = useState<Record<string, { date: string; time: string; accountId: string }>>({});

  useEffect(() => {
    // Populate with dummy assets initially
    setGenerations(dummyGenerationData);

    // Sync connected user accounts for destination selection
    const loadAccounts = async () => {
      try {
        const data = await api.socialAuth.syncAccounts();
        setAccounts(data);
      } catch (err) {
        console.error("Failed to load accounts in AI Composer:", err);
      }
    };
    loadAccounts();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt or idea first!");
      return;
    }

    setLoading(true);
    try {
      const result = await api.ai.generateContent(prompt, tone, aiImage);
      // Prepend the new generation to the list
      const newCard = {
        _id: `gen_${Date.now()}`,
        content: result.content,
        mediaUrl: result.mediaUrl,
        tone: result.tone,
        createdAt: result.createdAt,
      };
      setGenerations([newCard, ...generations]);
      setPrompt("");
    } catch (err: any) {
      alert(err.message || "Failed to generate AI content.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (cardId: string, field: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId] || { date: "", time: "", accountId: "" },
        [field]: value
      }
    }));
  };

  const handleSchedule = async (card: any) => {
    const cardInput = inputs[card._id];
    if (!cardInput || !cardInput.date || !cardInput.time) {
      alert("Please select both a date and time for scheduling.");
      return;
    }

    // Default to using the selected account or fall back to the first connected account
    const targetAccountId = cardInput.accountId || (accounts[0] ? accounts[0]._id : "");
    if (!targetAccountId) {
      alert("Please connect a social account first to schedule posts.");
      return;
    }

    try {
      const scheduledAt = new Date(`${cardInput.date}T${cardInput.time}`).toISOString();
      await api.posts.schedulePost({
        accounts: [targetAccountId],
        content: {
          text: card.content,
          mediaUrls: card.mediaUrl ? [card.mediaUrl] : []
        },
        scheduledAt,
      });

      alert("AI post scheduled successfully!");
      // Reset input fields for this card
      setInputs((prev) => {
        const updated = { ...prev };
        delete updated[card._id];
        return updated;
      });
    } catch (err: any) {
      alert(err.message || "Failed to schedule AI post.");
    }
  };

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
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-gray-500 text-sm">Generated Today</p>
          <h2 className="text-3xl font-bold mt-2">{generations.length}</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-gray-500 text-sm">Connected Accounts</p>
          <h2 className="text-3xl font-bold mt-2">{accounts.length}</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl border shadow-sm">
          <p className="text-gray-500 text-sm">Active Queue</p>
          <h2 className="text-3xl font-bold mt-2">Live sync enabled</h2>
        </div>
      </div>

      {/* Composer Input Box */}
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

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Tones Selection */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {tones.map((item) => (
            <button
              key={item}
              onClick={() => setTone(item)}
              className={`px-5 py-2 rounded-full border transition cursor-pointer ${
                tone === item
                  ? "bg-red-500 text-white border-red-500"
                  : "hover:bg-red-50 text-gray-700 border-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Generations Feed */}
      <div className="flex justify-between items-center mt-14 mb-6">
        <div className="flex items-center gap-2">
          <History size={20} />
          <h3 className="text-2xl font-semibold">Recent Generations</h3>
        </div>
        <span className="text-gray-500">{generations.length} total</span>
      </div>

      {/* Generation Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {generations.map((item: any) => {
          const cardInput = inputs[item._id] || { date: "", time: "", accountId: "" };
          return (
            <div
              key={item._id}
              className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              {item.mediaUrl && (
                <img
                  src={item.mediaUrl}
                  alt="AI Generated Banner"
                  className="w-full h-52 object-cover"
                />
              )}

              <div className="p-5">
                <div className="flex justify-between mb-3">
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-medium">
                    {item.tone}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-line text-sm leading-relaxed">
                  {item.content}
                </p>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Schedule this post
                  </h4>

                  {/* Destination Account Dropdown */}
                  <div>
                    <label className="text-xs text-gray-400 font-medium block mb-1">
                      CHOOSE TARGET PROFILE:
                    </label>
                    {accounts.length === 0 ? (
                      <span className="text-xs text-amber-600">
                        No connected account. Please go to Accounts tab first.
                      </span>
                    ) : (
                      <select
                        value={cardInput.accountId}
                        onChange={(e) => handleInputChange(item._id, "accountId", e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm text-gray-700 focus:ring-1 focus:ring-red-500"
                      >
                        <option value="">-- Select social platform --</option>
                        {accounts.map((acc) => (
                          <option key={acc._id} value={acc._id}>
                            {acc.platform.toUpperCase()} (@{acc.handle})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Date & Time Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={cardInput.date}
                      onChange={(e) => handleInputChange(item._id, "date", e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="time"
                      value={cardInput.time}
                      onChange={(e) => handleInputChange(item._id, "time", e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <button
                    onClick={() => handleSchedule(item)}
                    className="w-full mt-4 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:scale-105 transition cursor-pointer"
                  >
                    🚀 Schedule Post
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}