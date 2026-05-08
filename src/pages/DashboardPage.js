import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, ArrowRight, ShieldCheck, Briefcase, GraduationCap } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { publicAPI } from '../services/api';

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('');
        setNotice('');
        const resp = await publicAPI.getAlumniOfTheDay({ which: 'tomorrow' });
        const alum = resp.data?.data || null;
        setStats({
          tomorrowAlumni: alum,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setStats({ tomorrowAlumni: null });
          setNotice('No featured Alumni for Tomorrow');
        } else {
          setError(err.message || 'Unable to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;

  const featuredAlumni = stats?.tomorrowAlumni;
  const featuredSections = featuredAlumni
    ? [
        {
          key: 'degrees',
          label: 'Degrees',
          items: featuredAlumni.degrees || [],
          renderItem: (item) => `${item.title}${item.university ? ` - ${item.university}` : ''}`,
        },
        {
          key: 'certifications',
          label: 'Certifications',
          items: featuredAlumni.certifications || [],
          renderItem: (item) => `${item.title}${item.issuer ? ` - ${item.issuer}` : ''}`,
        },
        {
          key: 'licences',
          label: 'Licences',
          items: featuredAlumni.licences || [],
          renderItem: (item) => `${item.title}${item.issuing_body ? ` - ${item.issuing_body}` : ''}`,
        },
        {
          key: 'courses',
          label: 'Courses',
          items: featuredAlumni.courses || [],
          renderItem: (item) => `${item.title}${item.provider ? ` - ${item.provider}` : ''}`,
        },
        {
          key: 'employment',
          label: 'Employment',
          items: featuredAlumni.employment || [],
          renderItem: (item) => `${item.company || 'Company'}${item.role ? ` -- ${item.role}` : ''}${item.start_date ? ` : ${item.start_date}${item.end_date ? ` - ${item.end_date}` : ''}` : ''}`,
        },
      ].filter((section) => Array.isArray(section.items) && section.items.length > 0)
    : [];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-7 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white px-6 py-8 md:py-12 md:min-h-[180px] shadow-soft">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Dashboard Overview</h2>
                  <p className="text-slate-600 mt-3 max-w-2xl">
                    University Alumni Platform: curricular insights and current graduate results.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full lg:w-80 self-center">
                  <Link to="/analytics" className="rounded-xl bg-white border border-slate-200 p-4 hover:border-brand-300 transition">
                    <p className="text-xs text-slate-500">Go to</p>
                    <p className="font-bold text-slate-900">Analytics</p>
                  </Link>
                  <Link to="/alumni" className="rounded-xl bg-white border border-slate-200 p-4 hover:border-brand-300 transition">
                    <p className="text-xs text-slate-500">Go to</p>
                    <p className="font-bold text-slate-900">Alumni</p>
                  </Link>
                  <Link to="/bids" className="rounded-xl bg-white border border-slate-200 p-4 hover:border-brand-300 transition">
                    <p className="text-xs text-slate-500">Go to</p>
                    <p className="font-bold text-slate-900">Bids</p>
                  </Link>
                  <Link to="/api-keys" className="rounded-xl bg-white border border-slate-200 p-4 hover:border-brand-300 transition">
                    <p className="text-xs text-slate-500">Go to</p>
                    <p className="font-bold text-slate-900">API Keys</p>
                  </Link>
                </div>
              </div>
            </section>
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">
                  {error}
                </div>
              )}

              {notice && (
                <div className="rounded-2xl border border-amber-200 bg-amber-100 text-amber-800 px-4 py-3 shadow-soft text-center">
                  {notice}
                </div>
              )}

            {featuredAlumni && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <h3 className="text-2xl font-black text-slate-900 mb-4">Alumni Featured Tomorrow</h3>
                <div className="flex flex-col md:flex-row gap-5 md:items-center">
                  <img
                    src={featuredAlumni.profile_image || '/placeholder-avatar.png'}
                    alt={featuredAlumni.full_name}
                    className="w-24 h-24 rounded-full object-cover border"
                  />

                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-lg font-bold text-slate-900 ml-5">{featuredAlumni.full_name}</p>
                      {featuredAlumni.bio && <p className="text-sm text-slate-600 mt-1 max-w-3xl ml-5">{featuredAlumni.bio}</p>}
                    </div>

                    {featuredSections.length > 0 && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {featuredSections.map((section) => (
                          <div key={section.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h4 className="text-sm font-black uppercase tracking-wide text-slate-800 mb-3">{section.label}</h4>
                            <ul className="space-y-2">
                              {section.items.map((item, index) => (
                                <li key={`${section.key}-${index}`} className="text-sm text-slate-700 flex gap-2">
                                  <span className="mt-1 h-2 w-2 rounded-full bg-brand-600 flex-shrink-0" />
                                  <span>{section.renderItem(item)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
