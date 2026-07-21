import {
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  Share2Icon,
  TrendingUpIcon,
  PlusIcon,
  CalendarIcon,
  SparklesIcon,
  RefreshCwIcon,
  ArrowUpRightIcon,
  TrendingDownIcon,
  UserCheckIcon,
  ZapIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

interface Activity {
  _id: string;
  description: string;
  createdAt: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    schedule: 0,
    published: 0,
    connectedAccounts: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activity" | "insights">("activity");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const posts = await api.posts.getPosts();
      const accounts = await api.socialAuth.syncAccounts();

      const pendingCount = posts.filter((p: any) => p.status === 'pending').length;
      const completedCount = posts.filter((p: any) => p.status === 'completed').length;

      setStats({
        schedule: pendingCount,
        published: completedCount,
        connectedAccounts: accounts.length,
      });

      const activityData: Activity[] = posts.slice(0, 5).map((p: any) => {
        const platforms = p.accounts.map((a: any) => a.platform.toUpperCase()).join(', ');
        const actionVerb = p.status === 'completed' ? 'Published' : p.status === 'pending' ? 'Scheduled' : 'Processing/Failed';
        return {
          _id: p._id,
          description: `${actionVerb} post on ${platforms}: "${p.content.text.substring(0, 60)}${p.content.text.length > 60 ? '...' : ''}"`,
          createdAt: p.updatedAt || p.createdAt,
        };
      });

      setActivities(activityData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-1">
      {/* Premium Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-150">
              <SparklesIcon className="h-3 w-3" /> Live Workspace
            </span>
            <span className="text-xs text-slate-400 font-medium">Updated just now</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-800 tracking-tight">
            Elevate Your Presence
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Monitor engagement, manage queues, and schedule updates seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="group flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-md hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all shadow-xs hover:border-slate-300 disabled:opacity-50"
          >
            <RefreshCwIcon className={`h-3.5 w-3.5 text-slate-500 group-hover:text-slate-700 transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
            Sync Dashboard
          </button>
          
          <Link
            to="/ai-composer"
            className="flex items-center gap-2 rounded-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusIcon className="h-4 w-4" />
            AI Composer
          </Link>
        </div>
      </div>

      {/* Decorative Floating Color Blobs in Background */}
      <div className="absolute top-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"></div>
      <div className="absolute top-64 right-1/4 -z-10 h-72 w-72 rounded-full bg-pink-100/40 blur-3xl"></div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Card 1: Queue */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 backdrop-blur-lg p-6 shadow-sm shadow-slate-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/30">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-linear-to-br from-indigo-100/40 to-transparent transition-all group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50/50 px-2.5 py-1 rounded-md border border-indigo-100/50">
                Next In Line
              </span>
              <h3 className="mt-4 text-4xl font-black text-slate-800 tracking-tight leading-none">
                {stats.schedule}
              </h3>
              <p className="mt-2 text-xs font-bold text-slate-400">Scheduled Posts</p>
            </div>
            <div className="rounded-2xl bg-linear-to-tr from-indigo-50 to-indigo-100/60 p-3.5 text-indigo-600 transition-all shadow-xs group-hover:scale-110">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((stats.schedule / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-extrabold text-indigo-600 whitespace-nowrap bg-indigo-50/50 px-2 py-0.5 rounded">
              {stats.schedule > 0 ? `${stats.schedule} queued` : 'Empty'}
            </span>
          </div>
        </div>

        {/* Card 2: Published */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 backdrop-blur-lg p-6 shadow-sm shadow-slate-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100/30">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-linear-to-br from-rose-100/40 to-transparent transition-all group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 bg-rose-50/50 px-2.5 py-1 rounded-md border border-rose-100/50">
                Completed
              </span>
              <h3 className="mt-4 text-4xl font-black text-slate-800 tracking-tight leading-none">
                {stats.published}
              </h3>
              <p className="mt-2 text-xs font-bold text-slate-400">Published Campaigns</p>
            </div>
            <div className="rounded-2xl bg-linear-to-tr from-rose-50 to-rose-100/60 p-3.5 text-rose-600 transition-all shadow-xs group-hover:scale-110">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUpIcon className="h-3 w-3" /> +100% success rate
            </span>
            <span className="text-slate-400 font-medium">All time</span>
          </div>
        </div>

        {/* Card 3: Accounts */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 backdrop-blur-lg p-6 shadow-sm shadow-slate-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-100/30">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-linear-to-br from-amber-100/40 to-transparent transition-all group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50/50 px-2.5 py-1 rounded-md border border-amber-100/50">
                Integrations
              </span>
              <h3 className="mt-4 text-4xl font-black text-slate-800 tracking-tight leading-none">
                {stats.connectedAccounts}
              </h3>
              <p className="mt-2 text-xs font-bold text-slate-400">Connected Profiles</p>
            </div>
            <div className="rounded-2xl bg-linear-to-tr from-amber-50 to-amber-100/60 p-3.5 text-amber-600 transition-all shadow-xs group-hover:scale-110">
              <Share2Icon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live sync active
            </span>
            <Link to="/accounts" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-0.5">
              Add channel <ArrowUpRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Two-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Interactive Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-lg p-6 shadow-sm shadow-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                    activeTab === "activity"
                      ? "bg-slate-900 text-white shadow-md shadow-slate-950/20 scale-102"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Activity Log
                </button>
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                    activeTab === "insights"
                      ? "bg-slate-900 text-white shadow-md shadow-slate-950/20 scale-102"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Platform Reach
                </button>
              </div>

              <span className="text-[10px] font-extrabold text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                {activeTab === "activity" ? `${activities.length} updates` : "Simulated data"}
              </span>
            </div>

            {activeTab === "activity" ? (
              activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="rounded-full bg-linear-to-tr from-slate-50 to-slate-100 p-4.5 mb-4 text-slate-400 border border-slate-200/50 shadow-inner">
                    <ActivityIcon className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">All Quiet Here</p>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                    No recent events found. Once you begin creating and scheduling posts, updates will sync here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <div
                      key={activity._id}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 p-4 transition-all duration-200"
                    >
                      <div className="rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100/50 p-2.5 text-indigo-500 group-hover:scale-105 transition-all">
                        <Share2Icon className="h-4.5 w-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            Feed Event {idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded">
                            {new Date(activity.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Custom Elegant SVG Chart Dashboard Widget */
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <ZapIcon className="h-4 w-4 text-amber-500" /> Projected Impressions
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Impressions metrics projection based on historical account values.</p>
                </div>

                <div className="relative h-48 w-full border border-slate-100/50 rounded-2xl bg-linear-to-b from-indigo-50/20 to-white/80 p-4">
                  <svg className="h-full w-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="5" x2="100" y2="5" stroke="#f8fafc" strokeWidth="0.5" />
                    <line x1="0" y1="15" x2="100" y2="15" stroke="#f8fafc" strokeWidth="0.5" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#f8fafc" strokeWidth="0.5" />

                    {/* Gradient Fill */}
                    <path
                      d="M 0 30 L 0 24 Q 15 12 30 19 T 65 6 T 90 14 L 100 9 L 100 30 Z"
                      fill="url(#chartGradient)"
                    />
                    
                    {/* Main Line */}
                    <path
                      d="M 0 24 Q 15 12 30 19 T 65 6 T 90 14 L 100 9"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>

                    {/* Peak Point */}
                    <circle cx="65" cy="6" r="2" fill="#8b5cf6" stroke="#ffffff" strokeWidth="0.5" className="animate-pulse" />
                  </svg>
                  
                  <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Impressions</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-black text-slate-800">18.4k</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        +14.2%
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Clicks Count</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-black text-slate-800">1,940</span>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
                        -1.8%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Sidebar Panel */}
        <div className="space-y-6">
          
          {/* Scheduling Setup Action Widget */}
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 backdrop-blur-lg p-6 shadow-sm shadow-slate-100">
            <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-violet-100/40 -z-10 blur-xl"></div>
            
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-4.5 w-4.5 text-indigo-500" />
              Calendar Queue
            </h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
              Create campaigns, schedule specific intervals, and keep your queues organized.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to="/scheduler"
                className="w-full text-center inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white transition-all shadow-md active:scale-97 hover:scale-102"
              >
                Go to Scheduler Calendar
              </Link>
              
              <Link
                to="/accounts"
                className="w-full text-center inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 hover:border-slate-300 py-3 text-xs font-bold text-slate-600 hover:text-slate-800 transition-all bg-white/50 hover:bg-slate-50/80"
              >
                <UserCheckIcon className="h-4 w-4" />
                Manage channels ({stats.connectedAccounts})
              </Link>
            </div>
          </div>

          {/* Quick Informational Tip Card */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-50/50 to-violet-50/50 border border-indigo-100/50 p-6 shadow-xs">
            <div className="absolute -right-8 -top-8 text-indigo-600/5 pointer-events-none">
              <SparklesIcon className="h-32 w-32" />
            </div>
            
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
              <SparklesIcon className="h-3.5 w-3.5 text-indigo-600" /> AI Composer Tip
            </h4>
            <p className="mt-2 text-xs text-indigo-950/80 leading-relaxed font-medium">
              Try utilizing the **AI Composer** with a <strong>"Medium"</strong> length prompt for LinkedIn updates. This helps generate well-formed, multi-paragraph posts automatically with optimized hashtag placement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;