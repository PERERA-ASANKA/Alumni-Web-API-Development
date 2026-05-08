import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Download, SlidersHorizontal, FileDown } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { publicAPI } from '../services/api';
import { toast } from 'react-toastify';

const greenPalette = ['#008000', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#14532d'];
const mixedPalette = ['#008000', '#16a34a', '#2563eb', '#7c3aed', '#f59e0b', '#db2777', '#06b6d4', '#ef4444', '#14b8a6'];

const shuffleColors = (colors) => [...colors].sort(() => Math.random() - 0.5);

const getDistinctColors = (count, palette) => {
  const uniqueColors = shuffleColors(palette);
  if (count <= uniqueColors.length) {
    return uniqueColors.slice(0, count);
  }

  const colors = [...uniqueColors];
  while (colors.length < count) {
    const hue = Math.floor(Math.random() * 360);
    colors.push(`hsl(${hue} 70% 55%)`);
  }
  return colors;
};



const AnalyticsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [selectedCharts, setSelectedCharts] = useState({
    skills: true,
    industry: true,
    courses: true,
    geographic: true,
    jobTitles: true,
    employers: true,
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const [skillsRes, courseRes, sectorsRes, titlesRes, employersRes, geoRes] = await Promise.all([
          publicAPI.getSkillsGaps(),
          publicAPI.getCourseStats(),
          publicAPI.getIndustrySectors(),
          publicAPI.getJobTitles(),
          publicAPI.getTopEmployers(),
          publicAPI.getGeographicData(),
        ]);

        const sectorColors = getDistinctColors((sectorsRes.data || []).length, mixedPalette);
        const employerColors = getDistinctColors((employersRes.data || []).length, mixedPalette);
        const jobTitleColors = getDistinctColors((titlesRes.data || []).length, mixedPalette);
        const geographicColors = getDistinctColors((geoRes.data || []).length, mixedPalette);
        const skillsColors = getDistinctColors((skillsRes.data || []).length, mixedPalette);
        const courseColors = getDistinctColors(2, mixedPalette);

        const skillsData = (skillsRes.data || []).map((item, index) => ({
          ...item,
          fill: skillsColors[index],
        }));

        const sectorData = (sectorsRes.data || []).map((item, index) => ({
          ...item,
          fill: sectorColors[index],
        }));

        const employerData = (employersRes.data || []).map((item, index) => ({
          ...item,
          fill: employerColors[index],
        }));

        const jobTitleData = (titlesRes.data || []).map((item, index) => ({
          ...item,
          fill: jobTitleColors[index],
        }));

        const geographicData = (geoRes.data || []).map((item, index) => ({
          ...item,
          fill: geographicColors[index],
        }));

        setData({
          skillsGaps: skillsData,
          employmentByIndustry: sectorData,
          courseCompletion: courseRes.data || [],
          jobTitles: jobTitleData,
          topEmployers: employerData,
          geographic: geographicData,
          courseColors: {
            courses: courseColors[0],
            certifications: courseColors[1] || mixedPalette[4],
          },
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // toast.error('Failed to load analytics data');
        setData({
          skillsGaps: [],
          employmentByIndustry: [],
          courseCompletion: [],
          jobTitles: [],
          topEmployers: [],
          geographic: [],
          courseColors: { courses: '#008000', certifications: '#16a34a' },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const exportChartAsImage = async (chartId) => {
    const element = document.getElementById(chartId);
    if (!element) return;

    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${chartId}.png`;
    link.click();
  };

  const exportAsCSV = async () => {
    const chartMappings = {
      skills: { data: data?.skillsGaps || [], name: 'Top Certification Skills', headers: ['Skill', 'Percentage (%)'] },
      industry: { data: data?.employmentByIndustry || [], name: 'Employment by Industry', headers: ['Industry', 'Alumni Count'] },
      courses: { data: data?.courseCompletion || [], name: 'Course Completion Trends', headers: ['Month', 'Courses Completed', 'Certifications Completed'] },
      geographic: { data: data?.geographic || [], name: 'Geographic Distribution', headers: ['Region', 'Alumni Count'] },
      jobTitles: { data: data?.jobTitles || [], name: 'Top Job Titles', headers: ['Job Title', 'Alumni Count'] },
      employers: { data: data?.topEmployers || [], name: 'Top Employers', headers: ['Company', 'Alumni Count'] },
    };

    let csvContent = '';
    const selectedChartArray = Object.keys(selectedCharts).filter(key => selectedCharts[key]);
    
    selectedChartArray.forEach((key, idx) => {
      const chart = chartMappings[key];
      if (chart.data.length === 0) return;
      
      csvContent += `${chart.name}\n${chart.headers.join(',')}\n`;
      chart.data.forEach((item) => {
        if (key === 'skills') {
          csvContent += `"${item.skill || ''}",${item.percentage || ''}\n`;
        } else if (key === 'industry') {
          csvContent += `"${item.name || ''}",${item.value || ''}\n`;
        } else if (key === 'courses') {
          csvContent += `"${item.month || ''}",${item.courses || ''},${item.certifications || ''}\n`;
        } else if (key === 'geographic') {
          csvContent += `"${item.region || ''}",${item.value || ''}\n`;
        } else if (key === 'jobTitles') {
          csvContent += `"${item.name || ''}",${item.count || ''}\n`;
        } else if (key === 'employers') {
          csvContent += `"${item.company || ''}",${item.alumni || ''}\n`;
        }
      });
      
      if (idx < selectedChartArray.length - 1) {
        csvContent += '\n';
      }
    });

    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportModal(false);
  };

  const exportAsPDF = async () => {
    const pdf = new jsPDF();
    const chartIds = {
      skills: 'skills-gap-chart',
      industry: 'industry-chart',
      courses: 'course-trends-chart',
      geographic: 'geographic-chart',
      jobTitles: 'job-titles-chart',
      employers: 'employers-chart',
    };

    pdf.setFontSize(22);
    pdf.text('Alumni Analytics Report', 15, 15);

    let yPosition = 35;
    const pageHeight = pdf.internal.pageSize.height;
    const chartHeight = 80;

    for (const [key, chartId] of Object.entries(chartIds)) {
      if (!selectedCharts[key]) continue;

      const element = document.getElementById(chartId);
      if (!element) continue;

      if (yPosition + chartHeight > pageHeight - 10) {
        pdf.addPage();
        yPosition = 15;
      }

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 15, yPosition, 180, chartHeight);
      yPosition += chartHeight + 10;
    }

    pdf.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportModal(false);
  };

  const renderPieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`;

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-7 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Analytics & Trends</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setExportType('csv'); setShowExportModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                    <FileDown size={16} /> Export CSV
                  </button>
                  <button onClick={() => { setExportType('pdf'); setShowExportModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700">
                    <Download size={16} /> Export PDF
                  </button>
                </div>
              </div>
            </section>

            {showExportModal && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Select Charts to Export</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(selectedCharts).map(([key, checked]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setSelectedCharts({ ...selectedCharts, [key]: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-slate-700 capitalize">{key === 'jobTitles' ? 'Job Titles' : key === 'employers' ? 'Employers' : key}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => exportType === 'csv' ? exportAsCSV() : exportAsPDF()}
                    className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
                  >
                    Export as {exportType?.toUpperCase()}
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 bg-slate-300 text-slate-900 rounded-xl hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </section>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <article id="skills-gap-chart" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Top Certification Skills (%)</h3>
                  <button onClick={() => exportChartAsImage('skills-gap-chart')} className="text-brand-700 hover:text-brand-900">
                    <Download size={16} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.skillsGaps} layout="vertical" margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="skill" width={120} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Share of alumni']} />
                    <Bar dataKey="percentage" name="Share of alumni" radius={[0, 8, 8, 0]}>
                      {data.skillsGaps.map((entry, index) => (
                        <Cell key={entry.skill || index} fill={entry.fill || mixedPalette[index % mixedPalette.length]} />
                      ))}
                      <LabelList dataKey="label" position="right" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </article>

              <article id="industry-chart" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Employment by Industry</h3>
                  <button onClick={() => exportChartAsImage('industry-chart')} className="text-brand-700 hover:text-brand-900">
                    <Download size={16} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.employmentByIndustry}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      label={renderPieLabel}
                    >
                      {data.employmentByIndustry.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} alumni`, 'Count']} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </article>

              <article id="course-trends-chart" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Course Completion Trends</h3>
                  <button onClick={() => exportChartAsImage('course-trends-chart')} className="text-brand-700 hover:text-brand-900">
                    <Download size={16} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={data.courseCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ dy: 15 }} height={50} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="courses" name="Courses completed" stroke={ '#7c3aed'} strokeWidth={3}>
                      <LabelList dataKey="courses" position="top" />
                    </Line>
                    <Line type="monotone" dataKey="certifications" name="Certifications completed" stroke={'#16a34a'} strokeWidth={3}>
                      <LabelList dataKey="certifications" position="bottom" />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </article>

              <article id="geographic-chart" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Geographic Distribution by Location</h3>
                  <button onClick={() => exportChartAsImage('geographic-chart')} className="text-brand-700 hover:text-brand-900">
                    <Download size={16} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.geographic}
                      dataKey="value"
                      nameKey="region"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      label={renderPieLabel}
                    >
                      {data.geographic.map((entry, index) => (
                        <Cell key={entry.region || index} fill={entry.fill || mixedPalette[index % mixedPalette.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} alumni`, 'Count']} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </article>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <article id="job-titles-chart" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4">Top Job Titles</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.jobTitles} layout="vertical" margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(value) => [`${value} alumni`, 'Count']} />
                    <Bar dataKey="count" name="Alumni" radius={[0, 8, 8, 0]}>
                      {data.jobTitles.map((entry, index) => (
                        <Cell key={entry.name || index} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="label" position="right" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft" id="employers-chart">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Top Employers</h3>
                  <button onClick={() => exportChartAsImage('employers-chart')} className="text-brand-700 hover:text-brand-900">
                    <Download size={16} />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={data.topEmployers} margin={{ top: 20, right: 18, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="company"
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value} alumni`, 'Count']} />
                    <Bar dataKey="alumni" name="Alumni" radius={[8, 8, 0, 0]}>
                      {data.topEmployers.map((entry, index) => (
                        <Cell
                          key={entry.company || index}
                          fill={entry.fill || mixedPalette[index % mixedPalette.length]}
                        />
                      ))}
                      <LabelList dataKey="label" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
