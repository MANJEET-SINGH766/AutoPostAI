import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  History,
  Loader2,
  Copy,
  RotateCcw,
  Check,
  AlertCircle,
  BookOpen,
  LayoutGrid
} from "lucide-react";
import { dummyGenerationData } from "../assets/assets";
import { api } from "../services/api";

const tones = [
  "Professional",
  "Creative",
  "Funny",
  "Minimalist",
  "Excited",
  "Informative",
  "Empathetic"
];

const platforms = [
  { id: "linkedin", label: "LinkedIn", color: "from-blue-600 to-sky-500" },
  { id: "twitter", label: "Twitter / X", color: "from-gray-900 to-gray-700" },
  { id: "facebook", label: "Facebook", color: "from-blue-700 to-indigo-500" },
  { id: "instagram", label: "Instagram", color: "from-pink-600 to-purple-500" }
];

const lengths = ["Short", "Medium", "Long"];

export default function AIComposer() {
  // Form State
  const [platform, setPlatform] = useState("linkedin");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [targetAudience, setTargetAudience] = useState("");
  const [emojis, setEmojis] = useState(true);
  const [hashtags, setHashtags] = useState(true);
  const [callToAction, setCallToAction] = useState(true);

  // Editor State
  const [generatedContent, setGeneratedContent] = useState("");

  // Scheduling State
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Sync connected user accounts and populate history
  useEffect(() => {
    setGenerations(dummyGenerationData);

    const loadAccounts = async () => {
      try {
        const data = await api.socialAuth.syncAccounts();
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccountId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load accounts in AI Composer:", err);
      }
    };
    loadAccounts();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast("Please enter a topic or topic idea first!", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await api.ai.generateContent({
        platform,
        topic,
        tone,
        length,
        targetAudience,
        hashtags,
        emojis,
        callToAction
      });

      if (result.success) {
        setGeneratedContent(result.content);

        // Prepend the new generation to history
        const newCard = {
          _id: `gen_${Date.now()}`,
          prompt: topic,
          content: result.content,
          tone: tone,
          platform: platform,
          createdAt: new Date().toISOString()
        };
        setGenerations((prev) => [newCard, ...prev]);
        showToast("Post generated successfully! ✨", "success");
      } else {
        throw new Error(result.message || "Failed to generate AI content");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to generate AI content.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      showToast("Copied to clipboard! 📋", "success");
    } catch (err) {
      showToast("Failed to copy text.", "error");
    }
  };

  const handleLoadFromHistory = (item: any) => {
    setGeneratedContent(item.content);
    setTone(item.tone || "Professional");
    setPlatform(item.platform || "linkedin");
    setTopic(item.prompt || "");
    showToast("Loaded generation into editor", "info");
  };

  const handleSchedule = async () => {
    if (!generatedContent.trim()) {
      showToast("No content to schedule. Generate some content first!", "error");
      return;
    }
    if (!selectedAccountId) {
      showToast("Please select a target profile first.", "error");
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      showToast("Please choose both date and time to schedule the post.", "error");
      return;
    }

    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      await api.posts.schedulePost({
        accounts: [selectedAccountId],
        content: {
          text: generatedContent,
          mediaUrls: []
        },
        scheduledAt,
      });

      showToast("Post scheduled successfully! 🚀", "success");
      
      // Reset schedule inputs
      setScheduleDate("");
      setScheduleTime("");
    } catch (err: any) {
      showToast(err.message || "Failed to schedule post.", "error");
    }
  };

  // Live count analytics
  const wordCount = generatedContent.trim() ? generatedContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = generatedContent.length;
  
  // Dynamic estimated reading time (approx 3 words per second)
  const dynamicReadingTime = () => {
    if (wordCount === 0) return "0 sec";
    const sec = Math.ceil(wordCount / 3);
    return sec < 60 ? `${sec} sec` : `${Math.ceil(sec / 60)} min`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border transition-all duration-300 transform translate-y-0 text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : toast.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          {toast.type === "success" && <Check className="size-5 text-emerald-600 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="size-5 text-rose-600 shrink-0" />}
          {toast.type === "info" && <Sparkles className="size-5 text-blue-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            AI Social Composer <Sparkles className="text-amber-500 fill-amber-500" size={28} />
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            Create, optimize, and schedule platform-specific social media posts with frontier intelligence.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input form settings */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <LayoutGrid size={18} className="text-gray-500" /> Composer Settings
            </h2>
            <p className="text-xs text-gray-400">Configure parameters to customize the AI output.</p>
          </div>

          <hr className="border-gray-100" />

          {/* Platform Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Target Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((plat) => (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => setPlatform(plat.id)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition duration-200 cursor-pointer flex items-center justify-between ${
                    platform === plat.id
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  {plat.label}
                  {platform === plat.id && <div className="size-2 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Idea Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">What is the topic / idea?</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 tips for learning React and TypeScript in 2026, or sharing my thoughts on recent artificial intelligence trends"
              className="w-full h-32 border border-gray-200 rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
            />
          </div>

          {/* Tone & Length in same row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-700"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Length</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {lengths.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setLength(len)}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      length === len
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Software Engineers, Hiring Managers, Founders"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">Include Emojis</span>
                <span className="text-xs text-gray-400">Add contextual emojis throughout</span>
              </div>
              <button
                type="button"
                onClick={() => setEmojis(!emojis)}
                className={`w-12 h-6 rounded-full relative transition duration-200 cursor-pointer ${
                  emojis ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                    emojis ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">Include Hashtags</span>
                <span className="text-xs text-gray-400">Append relevant hashtags at the end</span>
              </div>
              <button
                type="button"
                onClick={() => setHashtags(!hashtags)}
                className={`w-12 h-6 rounded-full relative transition duration-200 cursor-pointer ${
                  hashtags ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                    hashtags ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">Add Call to Action</span>
                <span className="text-xs text-gray-400">Inject an engaging hook or CTA at the bottom</span>
              </div>
              <button
                type="button"
                onClick={() => setCallToAction(!callToAction)}
                className={`w-12 h-6 rounded-full relative transition duration-200 cursor-pointer ${
                  callToAction ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                    callToAction ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer text-base shadow-md shadow-indigo-100"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Gemini is composing...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Social Post
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Interactive Editor & Scheduler */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI Composer Editor</h2>
                <p className="text-xs text-gray-400">Refine the generated post directly inside this window.</p>
              </div>

              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition cursor-pointer"
                    title="Copy to clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition cursor-pointer"
                    title="Regenerate post"
                  >
                    <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              )}
            </div>

            {/* Textarea Editor */}
            <div className="flex-1 relative mb-6">
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-10 transition">
                  <Loader2 className="size-10 text-indigo-600 animate-spin mb-4" />
                  <p className="font-semibold text-gray-700 animate-pulse">Composing content with Gemini API...</p>
                </div>
              )}

              {generatedContent ? (
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full h-[280px] border border-gray-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 leading-relaxed font-normal text-sm"
                />
              ) : (
                <div className="w-full h-[280px] border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <Sparkles size={40} className="text-gray-300 mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-gray-500">Your custom AI post will appear here</p>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">
                    Fill in the details on the left panel, and click Generate. You can then edit the text before scheduling.
                  </p>
                </div>
              )}
            </div>

            {/* Analytics Stats bar */}
            {generatedContent && (
              <div className="grid grid-cols-3 gap-3 border-t pt-4 border-gray-100 text-center mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-xs text-gray-400 block font-medium">Word Count</span>
                  <span className="text-base font-bold text-gray-700 mt-1 block">{wordCount}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-xs text-gray-400 block font-medium">Character Count</span>
                  <span className="text-base font-bold text-gray-700 mt-1 block">{charCount}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-xs text-gray-400 block font-medium flex items-center justify-center gap-1">
                    <BookOpen size={12} /> Reading Time
                  </span>
                  <span className="text-base font-bold text-indigo-600 mt-1 block">
                    {dynamicReadingTime()}
                  </span>
                </div>
              </div>
            )}

            {/* Scheduling Box */}
            {generatedContent && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  🚀 Schedule Immediately (Zernio Integration)
                </h3>

                {/* Profile selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 block">Select Profile</label>
                  {accounts.length === 0 ? (
                    <span className="text-xs text-amber-600 font-medium">
                      No accounts connected. Connect accounts in the Accounts tab first.
                    </span>
                  ) : (
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.platform.toUpperCase()} (@{acc.handle})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date & Time selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 block">Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSchedule}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl text-xs transition duration-200 cursor-pointer shadow-sm hover:scale-[1.01]"
                >
                  Schedule Post Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generations Feed */}
      <div className="max-w-7xl mx-auto mt-14">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <History size={22} className="text-gray-500" />
            <h3 className="text-2xl font-bold text-gray-900">Recent AI Generations</h3>
          </div>
          <span className="text-sm text-gray-400 font-medium">{generations.length} items</span>
        </div>

        {/* Generation Cards */}
        {generations.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-gray-400">
            No history available yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {generations.map((item: any) => (
              <div
                key={item._id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                      {item.platform || "Platform"}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {item.tone}
                    </span>
                  </div>

                  {item.prompt && (
                    <p className="text-xs font-semibold text-gray-500 mb-2 line-clamp-1 italic">
                      Prompt: "{item.prompt}"
                    </p>
                  )}

                  <p className="text-gray-600 whitespace-pre-line text-xs leading-relaxed line-clamp-6">
                    {item.content}
                  </p>
                </div>

                <div className="border-t border-gray-50 pt-4 mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleLoadFromHistory(item)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
                  >
                    Load into Editor <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}