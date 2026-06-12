import React from 'react';
import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  UserIcon,
  Wand2Icon,
  LogOutIcon
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const {logout,user}={
    logout:()=>{
      window.location.href="/"
    },
    user:{
      name:"John Doe",
      email:"john.doe@example.com"
    }
  }
  const location = useLocation();

  const navItems = [
  { name: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
  { name: "Accounts", icon: UserIcon, path: "/accounts" },
  { name: "Schedules", icon: CalendarDaysIcon, path: "/scheduler" },
  { name: "AI Composer", icon: Wand2Icon, path: "/ai-composer" },
];

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="size-6" />
          Scheduler
        </div>
      </div>

      {/* Nav Heading */}
      <div className="px-6 py-4">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          Menu
        </span>
      </div>

      {/* Nav Items */}
      <nav className="px-4 py-2 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setIsOpen(false) }
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="size-5" />

              <span>{item.name}</span>

              {isActive && (
                <span className="ml-auto text-blue-500">•</span>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/*user footer*/}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full text-left text-sm text-gray-500 hover:text-gray-700"
        >
          <LogOutIcon className="size-4 inline-block mr-1" />
          Sign Out

        </button>
      </div>
    </div>
  );
};

export default Sidebar;