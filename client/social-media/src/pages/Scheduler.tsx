import { useState, useEffect } from "react";
import { Calendar, Clock, ImagePlus, Trash2 } from "lucide-react";
import { api } from "../services/api";

const Scheduler = () => {
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch user's connected accounts
      const accountsData = await api.socialAuth.syncAccounts();
      setAccounts(accountsData);

      // Fetch user's scheduled/published posts
      const postsData = await api.posts.getPosts();
      setPosts(postsData);
    } catch (err: any) {
      console.error("Error fetching scheduler data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.posts.uploadMedia(file);
      setMediaUrl(res.url);
    } catch (err: any) {
      alert(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAccounts.length === 0) {
      alert("Please select at least one social account to post to.");
      return;
    }

    if (!content.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    if (!date || !time) {
      alert("Please select both a date and a time for scheduling.");
      return;
    }

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      await api.posts.schedulePost({
        accounts: selectedAccounts,
        content: { 
          text: content,
          mediaUrls: mediaUrl ? [mediaUrl] : []
        },
        scheduledAt,
      });

      alert("Post scheduled successfully!");
      setContent("");
      setDate("");
      setTime("");
      setSelectedAccounts([]);
      setMediaUrl("");
      
      // Refresh posts list
      const postsData = await api.posts.getPosts();
      setPosts(postsData);
    } catch (err: any) {
      alert(err.message || "Failed to schedule post.");
    }
  };

  const handleCancelPost = async (postId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled post?")) return;
    try {
      await api.posts.cancelPost(postId);
      alert("Post cancelled and moved to drafts.");
      const postsData = await api.posts.getPosts();
      setPosts(postsData);
    } catch (err: any) {
      alert(err.message || "Failed to cancel post.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.posts.deletePost(postId);
      alert("Post deleted successfully.");
      const postsData = await api.posts.getPosts();
      setPosts(postsData);
    } catch (err: any) {
      alert(err.message || "Failed to delete post.");
    }
  };

  const upcomingPosts = posts.filter((p) => p.status === "pending" || p.status === "processing" || p.status === "failed");
  const publishedPosts = posts.filter((p) => p.status === "completed");

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 font-semibold">Loading scheduling dashboard...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-6">Compose Post</h2>

            {/* Platforms */}
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-3">
                SELECT ACCOUNTS
              </p>

              {accounts.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No accounts connected. Go to the Accounts tab to connect.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {accounts.map((acc) => {
                    const isSelected = selectedAccounts.includes(acc._id);
                    return (
                      <button
                        key={acc._id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAccounts(selectedAccounts.filter((id) => id !== acc._id));
                          } else {
                            setSelectedAccounts([...selectedAccounts, acc._id]);
                          }
                        }}
                        className={`px-3 py-1.5 border rounded-xl font-semibold transition cursor-pointer text-sm ${
                          isSelected
                            ? "bg-red-500 border-red-500 text-white"
                            : "hover:bg-red-50 hover:border-red-500 text-gray-700 border-gray-200"
                        }`}
                      >
                        {acc.platform.toUpperCase()} (@{acc.handle})
                      </button>
                    );
                  })}
                </div>
              )}
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

              {mediaUrl ? (
                <div className="relative border rounded-xl overflow-hidden h-32 bg-gray-50">
                  <img src={mediaUrl} alt="Upload Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrl("")}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 text-xs hover:bg-red-600 cursor-pointer"
                  >
                    ✕ remove
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  {uploading ? (
                    <span className="text-gray-500 font-medium">Uploading file...</span>
                  ) : (
                    <>
                      <ImagePlus className="mb-2 text-gray-400" />
                      <span className="text-gray-500 text-sm">
                        Click to upload image or video
                      </span>
                      <input type="file" accept="image/*,video/*" onChange={handleFileChange} hidden />
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-4 text-gray-400 pointer-events-none"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-xl pl-10 pr-3 py-3"
                />
              </div>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-3 top-4 text-gray-400 pointer-events-none"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border rounded-xl pl-10 pr-3 py-3"
                />
              </div>
            </div>

            {/* Schedule Button */}
            <button
              onClick={handleSchedule}
              className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition cursor-pointer"
            >
              Schedule Post →
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* Upcoming */}
            <div className="bg-white rounded-2xl border shadow-sm">
              <div className="flex justify-between items-center p-5 border-b">
                <h3 className="font-bold text-lg">Upcoming / Queue</h3>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {upcomingPosts.length}
                </span>
              </div>

              <div className="p-5 max-h-[400px] overflow-y-auto space-y-4">
                {upcomingPosts.length === 0 ? (
                  <p className="text-gray-400 text-sm">No upcoming posts queued.</p>
                ) : (
                  upcomingPosts.map((post) => (
                    <div key={post._id} className="border-b pb-4 last:border-0 last:pb-0">
                      <p className="text-gray-700">{post.content.text}</p>
                      {post.content.mediaUrls && post.content.mediaUrls.length > 0 && (
                        <img src={post.content.mediaUrls[0]} alt="Uploaded Attachment" className="mt-2 rounded-lg max-h-40 object-cover" />
                      )}

                      <div className="flex justify-between items-center mt-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {post.accounts.map((acc: any) => (
                            <span key={acc._id} className="bg-slate-100 text-xs px-2 py-0.5 rounded-md">
                              {acc.platform}
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-500">{formatDate(post.scheduledAt)}</span>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          post.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                          post.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {post.status.toUpperCase()}
                        </span>
                        
                        <div className="flex gap-2">
                          {post.status === "pending" && (
                            <button
                              onClick={() => handleCancelPost(post._id)}
                              className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="size-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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

              <div className="max-h-[400px] overflow-y-auto">
                {publishedPosts.length === 0 ? (
                  <p className="p-5 text-gray-400 text-sm">No published posts yet.</p>
                ) : (
                  publishedPosts.map((post) => (
                    <div key={post._id} className="p-5 border-b hover:bg-gray-50 transition">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-wrap gap-1">
                          {post.accounts.map((acc: any) => (
                            <span key={acc._id} className="font-medium text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {acc.platform}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {formatDate(post.publishedAt || post.scheduledAt)}
                          </span>

                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                            Published
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-gray-700">{post.content.text}</p>
                      {post.content.mediaUrls && post.content.mediaUrls.length > 0 && (
                        <img src={post.content.mediaUrls[0]} alt="Uploaded Attachment" className="mt-2 rounded-lg max-h-40 object-cover" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;