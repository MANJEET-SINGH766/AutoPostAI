import {
  ActivityIcon,
  CheckCircleIcon,
  ClockIcon,
  Share2Icon,
  TrendingUpIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        // Generate activity logs based on recent posts
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
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      label: "Scheduled Posts",
      value: stats.schedule,
      icon: ClockIcon,
      trend: "+2 today",
    },
    {
      label: "Published Posts",
      value: stats.published,
      icon: CheckCircleIcon,
      trend: "All time",
    },
    {
      label: "Connected Accounts",
      value: stats.connectedAccounts,
      icon: Share2Icon,
      trend: "Active",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to your Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Here you can manage your social media accounts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statsCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
               className="rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.label}
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-gray-900">
                    {card.value}
                  </h3>
                </div>

                <div className="rounded-full bg-blue-100 p-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-600">
                <TrendingUpIcon className="mr-1 h-4 w-4 text-emerald-600" />
                {card.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Activity Feed
          </h2>

          <span className="text-sm text-gray-500">
            {activities.length} events
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center">
            <ActivityIcon className="h-12 w-12 text-gray-400" />

            <p className="mt-3 text-sm text-gray-500">
              No recent activity
            </p>

            <p className="text-sm text-gray-400">
              Connect accounts and schedule posts to see events here
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <div className="rounded-full bg-gray-100 p-2">
                  <Share2Icon className="h-5 w-5 text-gray-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-blue-600">
                      Activity
                    </span>

                    <span className="text-xs text-gray-400">
                      {new Date(
                        activity.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-800">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;