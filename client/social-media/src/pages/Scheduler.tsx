import { useState } from "react";
import { Calendar, Clock, ImagePlus } from "lucide-react";

const Scheduler = () => {
  const [content, setContent] = useState("");

  const upcomingPosts = [
    {
      id: 1,
      platform: "Facebook",
      content:
        "Exciting Opportunity: Data Analyst! Are you a highly analytical professional passionate about data?",
      date: "19 Jun 2026, 7:39 PM",
    },
  ];

  const publishedPosts = [
    {
      id: 1,
      platform: "LinkedIn",
      content: "Hi Everyone",
      date: "8 Jun 2026, 1:35 PM",
    },
    {
      id: 2,
      platform: "LinkedIn",
      content:
        "Artificial Intelligence is no longer a futuristic concept; it's transforming the world today.",
      date: "12 Jun 2026, 11:44 AM",
    },
    {
      id: 3,
      platform: "LinkedIn",
      content:
        "Unlock your potential in the rapidly evolving world of Artificial Intelligence.",
      date: "12 Jun 2026, 11:56 AM",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-6">Compose Post</h2>

          {/* Platforms */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-3">
              PLATFORMS
            </p>

            <div className="flex gap-3">
              {["X", "IN", "FB", "IG"].map((item) => (
                <button
                  key={item}
                  className="w-14 h-14 border rounded-xl hover:bg-red-50 hover:border-red-500 transition font-semibold"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-500 mb-3">
              CONTENT
            </p>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              placeholder="What do you want to share today?"
              className="w-full h-40 border rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-red-500"
            />

            <p className="text-right text-sm text-gray-400 mt-1">
              {content.length}/280
            </p>
          </div>

          {/* Media Upload */}
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-500 mb-3">
              MEDIA (OPTIONAL)
            </p>

            <label className="border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <ImagePlus className="mb-2 text-gray-400" />
              <span className="text-gray-500">
                Click to upload image or video
              </span>
              <input type="file" hidden />
            </label>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-3 top-4 text-gray-400"
              />
              <input
                type="date"
                className="w-full border rounded-xl pl-10 pr-3 py-3"
              />
            </div>

            <div className="relative">
              <Clock
                size={18}
                className="absolute left-3 top-4 text-gray-400"
              />
              <input
                type="time"
                className="w-full border rounded-xl pl-10 pr-3 py-3"
              />
            </div>
          </div>

          {/* Schedule Button */}
          <button className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition">
            Schedule Post →
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Upcoming */}
          <div className="bg-white rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-bold text-lg">Upcoming</h3>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {upcomingPosts.length}
              </span>
            </div>

            <div className="p-5">
              {upcomingPosts.map((post) => (
                <div key={post.id}>
                  <p className="text-gray-700">{post.content}</p>

                  <div className="flex justify-between mt-3 text-sm text-gray-500">
                    <span>{post.platform}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Published */}
          <div className="bg-white rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="font-bold text-lg">Published</h3>

              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {publishedPosts.length}
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {publishedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 border-b hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{post.platform}</span>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {post.date}
                      </span>

                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                        Published
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-gray-700">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;