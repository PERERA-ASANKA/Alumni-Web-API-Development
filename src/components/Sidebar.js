import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  TrendingUp,
  Key,
  UserCircle2,
  ChevronRight,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: UserCircle2 },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Alumni', path: '/alumni', icon: Users },
    { label: 'Bids', path: '/bids', icon: TrendingUp },
    { label: 'API Keys', path: '/api-keys', icon: Key },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 lg:hidden z-20"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:static w-64 h-screen bg-[linear-gradient(120deg,#008000,#66cc66_85%,#ffffff)] text-white transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between lg:justify-center border-b border-white/10">
          <h2 className="text-xl font-extrabold tracking-tight">Alumni Platform</h2>
          <button onClick={toggleSidebar} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-8 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  active
                    ? 'bg-white text-slate-900 font-semibold'
                    : 'text-slate-100 hover:bg-white/15'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {active && <ChevronRight size={20} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
