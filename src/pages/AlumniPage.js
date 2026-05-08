import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, GraduationCap, Briefcase, Building2, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { publicAPI } from '../services/api';
import { toast } from 'react-toastify';

const AlumniPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    program: '',
    graduationYear: '',
    industrySector: '',
    searchTerm: '',
  });
  const [total, setTotal] = useState(0);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.program) params.program = filters.program;
      if (filters.graduationYear) params.graduationYear = filters.graduationYear;
      if (filters.industrySector) params.industrySector = filters.industrySector;
      if (filters.searchTerm.trim()) params.searchTerm = filters.searchTerm.trim();

      const res = await publicAPI.getAlumni(params);
      setAlumni(res.data?.alumni || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      // toast.error(error.response?.data?.message || 'Failed to load alumni data');
      setAlumni([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const programOptions = useMemo(() => {
    const values = alumni.map((person) => person.degree?.title).filter(Boolean);
    return Array.from(new Set(values));
  }, [alumni]);

  const industryOptions = useMemo(() => {
    const values = alumni.map((person) => person.industry).filter(Boolean);
    return Array.from(new Set(values));
  }, [alumni]);

  const visibleAlumni = alumni;

  const matchesSummary = useMemo(() => ({
    degrees: programOptions.length,
    industries: industryOptions.length,
    visible: visibleAlumni.length,
  }), [programOptions.length, industryOptions.length, visibleAlumni.length]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = async () => {
    const clearedFilters = { program: '', graduationYear: '', industrySector: '', searchTerm: '' };
    setFilters(clearedFilters);

    setLoading(true);
    try {
      const res = await publicAPI.getAlumni({});
      setAlumni(res.data?.alumni || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error(error.response?.data?.message || 'Failed to load alumni data');
      setAlumni([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-7 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Alumni Hub</h2>
                  <p className="text-slate-500 mt-2">
                    Showing only profiles that already exist.
                  </p>
                </div>
                <button
                  onClick={fetchAlumni}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 grid place-items-center mb-3"><GraduationCap size={20} /></div>
                <p className="text-sm text-slate-500">Degrees</p>
                <p className="text-4xl font-black text-slate-900">{matchesSummary.degrees}</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center mb-3"><Briefcase size={20} /></div>
                <p className="text-sm text-slate-500">Industries</p>
                <p className="text-4xl font-black text-slate-900">{matchesSummary.industries}</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 grid place-items-center mb-3"><Building2 size={20} /></div>
                <p className="text-sm text-slate-500">Visible Profiles</p>
                <p className="text-4xl font-black text-slate-900">{matchesSummary.visible}</p>
              </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} className="text-brand-600" />
                <h3 className="font-semibold text-slate-800">Filter Alumni</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or company"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="h-11 pl-9 pr-3 rounded-xl border border-slate-300 w-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <select
                  value={filters.program}
                  onChange={(e) => handleFilterChange('program', e.target.value)}
                  className="h-11 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Degrees</option>
                  {programOptions.map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>

                <select
                  value={filters.graduationYear}
                  onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                  className="h-11 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Years</option>
                  {Array.from(new Set(alumni.map((person) => person.graduationYear).filter(Boolean)))
                    .sort((a, b) => Number(b) - Number(a))
                    .map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                <select
                  value={filters.industrySector}
                  onChange={(e) => handleFilterChange('industrySector', e.target.value)}
                  className="h-11 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Industries</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={fetchAlumni}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-soft">

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-sm text-slate-600">
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Degree</th>
                      <th className="px-6 py-3 text-left">Graduation Year</th>
                      <th className="px-6 py-3 text-left">Industry</th>
                      <th className="px-6 py-3 text-left">Company</th>
                      <th className="px-6 py-3 text-left">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading alumni...</td>
                      </tr>
                    ) : visibleAlumni.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                          No alumni profiles match your filters.
                        </td>
                      </tr>
                    ) : (
                      visibleAlumni.map((person) => (
                        <tr key={person.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold">
                                {(person.name || 'NA')
                                  .split(' ')
                                  .filter(Boolean)
                                  .map((namePart) => namePart[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 block">{person.name}</span>
                                {person.location && <span className="text-xs text-slate-500">{person.location}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {person.degree?.title || person.degrees?.[0] || 'N/A'}
                            {person.degree?.university ? <span className="block text-xs text-slate-500">{person.degree.university}</span> : null}
                          </td>
                          <td className="px-6 py-4 text-slate-700">{person.graduationYear || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                              {person.industry || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{person.company || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-700">{person.position || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlumniPage;
