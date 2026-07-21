import {
  PlusIcon,
  Trash2Icon,
  CheckCircle2Icon,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  PLATFORMS,
} from "../assets/assets";
import { api } from "../services/api";

const Accounts = () => {
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.socialAuth.syncAccounts();
      setAccounts(data);
    } catch (err: any) {
      console.error("Failed to sync accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (platformId: string) => {
    try {
      const res = await api.socialAuth.getConnectUrl(platformId);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err.message || `Failed to connect to ${platformId}`);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await api.socialAuth.disconnectAccount(accountId);
      await fetchAccounts();
    } catch (err: any) {
      alert(err.message || "Failed to disconnect account");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Connected Accounts
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage and connect your social media accounts.
          </p>
        </div>

        <button
          onClick={() => setShowPlatformPicker(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <PlusIcon className="size-5" />
          Connect Account
        </button>
      </div>

      {/* Stats */}
      <div className="rounded-3xl border border-gray-200 bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50 p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Connected Platforms
        </p>

        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-4xl font-bold text-gray-900">
            {accounts.length}
            <span className="ml-2 text-xl text-gray-400">
              / {PLATFORMS.length}
            </span>
          </h2>

          <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            Active
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="text-center py-12 rounded-3xl border border-gray-200 bg-white shadow-sm font-semibold text-gray-500">
          Syncing connected accounts...
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => {
            const platform = PLATFORMS.find(
              (p) => p.id === account.platform
            );

            if (!platform) return null;

            const Icon = platform.icon;

            return (
              <div
                key={account._id}
                className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-gray-100 p-3 transition-all group-hover:bg-primary/10">
                      <Icon className="size-6" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {platform.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        @{account.handle}
                      </p>
                    </div>
                  </div>

                  <CheckCircle2Icon className="size-5 text-green-500" />
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  {platform.description}
                </p>

                <div className="my-4 h-px bg-gray-100" />

                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {account.status}
                  </span>

                  <button 
                    onClick={() => handleDisconnect(account._id)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2Icon className="size-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Card */}
          <button
            onClick={() => setShowPlatformPicker(true)}
            className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
          >
            <div className="rounded-full bg-primary/10 p-4">
              <PlusIcon className="size-8 text-primary" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              Add New Account
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Connect another platform
            </p>
          </button>
        </div>
      )}

      {/* Platform Picker Modal */}
      {showPlatformPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Connect Platform
              </h2>

              <button
                onClick={() => setShowPlatformPicker(false)}
                className="rounded-lg px-3 py-1 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon;

                return (
                  <button
                    key={platform.id}
                    onClick={() => handleConnect(platform.id)}
                    className="group flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-gray-100 p-3 group-hover:bg-primary/10">
                        <Icon className="size-5" />
                      </div>

                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          {platform.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {platform.description}
                        </p>
                      </div>
                    </div>

                    <PlusIcon className="size-5 text-primary" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;