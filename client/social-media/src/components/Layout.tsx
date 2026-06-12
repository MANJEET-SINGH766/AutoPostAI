import { useState } from "react";
import Sidebar from "./Sidebar";
import { MenuIcon } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "Accounts",
  "/ai-composer": "AI Composer",
  "/scheduler": "Scheduler",
};

const Layout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "SocialAI";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Top Bar */}
        <header className="flex items-center gap-4 mb-6">
          <button
            className="text-gray-500 md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-600">
              Welcome to your {title}
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="bg-white rounded-lg shadow-md p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
