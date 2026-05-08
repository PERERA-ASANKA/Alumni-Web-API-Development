import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ShieldCheck, KeyRound, Database, FileDown, LayoutDashboard } from 'lucide-react';

const HomePage = () => {

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#ecfdf5_0%,#f7fff9_35%,#ffffff_70%,#f0fdf4_100%)] text-slate-900">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/75 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#008000] text-white grid place-items-center font-bold">AP</div>
            <div>
              <p className="font-bold tracking-tight text-lg">Alumni Platform</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-lg border border-green-200 hover:bg-green-50 transition">Login</Link>
            <Link to="/register" className="px-4 py-2 rounded-lg bg-[#008000] text-white hover:bg-[#006b00] transition">Create Account</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <h1 className="text-5xl leading-tight font-black tracking-tight mb-4">Secure and data-rich dashboard for alumni platform.</h1>
            <p className="text-slate-600 text-lg mb-7">Monitor graduate outcomes, skill trends, employer demand, bidding performance in one web interface.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="px-5 py-3 rounded-xl bg-[#008000] text-white hover:bg-[#006b00] transition">Open Dashboard</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
