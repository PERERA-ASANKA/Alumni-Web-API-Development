import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 size={30} className="text-teal-600" />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Alumni Platform</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-slate-800">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
            title="Logout"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
