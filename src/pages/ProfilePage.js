import React, { useEffect, useState } from 'react';
import { Save, Plus, UserCircle2, Briefcase, GraduationCap, Award, BookOpen, Upload, X } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { profileAPI } from '../services/api';
import { toast } from 'react-toastify';

const initialCore = {
  full_name: '',
  bio: '',
  linkedin_url: '',
};

const initialDegree = {
  title: '',
  university: '',
  url: '',
  completion_date: '',
};

const initialCertification = {
  title: '',
  issuer: '',
  url: '',
  completion_date: '',
};

const initialLicence = {
  title: '',
  issuing_body: '',
  url: '',
  completion_date: '',
};

const initialCourse = {
  title: '',
  provider: '',
  url: '',
  completion_date: '',
};

const initialEmployment = {
  company: '',
  role: '',
  industry: '',
  location: '',
  start_date: '',
  end_date: '',
};

const formatDate = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const defaultAvatar = '/user.png';

const ProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const [coreForm, setCoreForm] = useState(initialCore);
  const [degreeForm, setDegreeForm] = useState(initialDegree);
  const [certificationForm, setCertificationForm] = useState(initialCertification);
  const [licenceForm, setLicenceForm] = useState(initialLicence);
  const [courseForm, setCourseForm] = useState(initialCourse);
  const [employmentForm, setEmploymentForm] = useState(initialEmployment);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const fetchProfile = async () => {
    try {
      const { data } = await profileAPI.getProfile();
      setProfileData(data);
      setHasProfile(true);
      setCoreForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
        linkedin_url: data.linkedin_url || '',
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false);
        setProfileData(null);
        setCoreForm(initialCore);
      } else {
        toast.error(error.response?.data?.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveCore = async (e) => {
    e.preventDefault();
    try {
      if (hasProfile) {
        await profileAPI.updateProfile(coreForm);
        toast.success('Profile updated');
      } else {
        await profileAPI.createProfile(coreForm);
        toast.success('Profile created');
      }
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await profileAPI.uploadProfileImage(formData);
      console.log('Upload response:', data); 
      toast.success('Profile image uploaded successfully!');
      if (data?.image_url) {
        setProfileData((prev) => ({
          ...prev,
          profile_image: data.image_url,
        }));
      }
      setTimeout(() => fetchProfile(), 300);
    } catch (error) {
      console.error('Upload error:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addDegree = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.addDegree(degreeForm);
      setDegreeForm(initialDegree);
      toast.success('Degree added');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add degree');
    }
  };

  const addCertification = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.addCertification(certificationForm);
      setCertificationForm(initialCertification);
      toast.success('Certification added');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add certification');
    }
  };

  const addLicence = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.addLicence(licenceForm);
      setLicenceForm(initialLicence);
      toast.success('Licence added');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add licence');
    }
  };

  const addCourse = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.addCourse(courseForm);
      setCourseForm(initialCourse);
      toast.success('Course added');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add course');
    }
  };

  const addEmployment = async (e) => {
    e.preventDefault();
    try {
      await profileAPI.addEmployment(employmentForm);
      setEmploymentForm(initialEmployment);
      toast.success('Employment added');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employment');
    }
  };

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  const renderRecordList = (title, items, renderItem, emptyMessage, actionLabel, onAction) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h4 className="font-bold text-slate-900 text-lg">{title}</h4>
        <div className="flex items-center gap-2">
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
            >
              <Plus size={14} /> {actionLabel}
            </button>
          )}
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {items.length} item{items.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => renderItem(item))}
        </div>
      )}
    </article>
  );

  const degrees = profileData?.Degrees || [];
  const certifications = profileData?.Certifications || [];
  const licences = profileData?.Licences || [];
  const courses = profileData?.Courses || [];
  const employments = profileData?.Employments || [];

  const modalTitleMap = {
    degree: 'Add Degree',
    certification: 'Add Certification',
    licence: 'Add Licence',
    course: 'Add Course',
    employment: 'Add Employment',
  };

  const modalDescriptionMap = {
    degree: 'Enter your academic qualification details.',
    certification: 'Enter your certification details.',
    licence: 'Enter your licence details.',
    course: 'Enter your course details.',
    employment: 'Enter your employment history details.',
  };

  if (loading) return <Loader />;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-7 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">My Alumni Profile</h2>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Core Profile</h3>
              <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-sm font-semibold text-slate-700 mb-3">Profile Picture</p>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white grid place-items-center overflow-hidden">
                    <img
                      src={profileData?.profile_image || defaultAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.onerror = null;
                        img.src = defaultAvatar;
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white cursor-pointer hover:bg-brand-700 transition">
                      <Upload size={16} />
                      <span>{uploadingImage ? 'Uploading...' : 'Choose Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF (max 2MB)</p>
                  </div>
                </div>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveCore}>
                <input
                  className="rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Full name"
                  value={coreForm.full_name}
                  onChange={(e) => setCoreForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  required
                />
                <input
                  className="rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="LinkedIn URL"
                  value={coreForm.linkedin_url}
                  onChange={(e) => setCoreForm((prev) => ({ ...prev, linkedin_url: e.target.value }))}
                />
                <textarea
                  className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
                  placeholder="Short bio"
                  rows={4}
                  value={coreForm.bio}
                  onChange={(e) => setCoreForm((prev) => ({ ...prev, bio: e.target.value }))}
                />
                <div className="md:col-span-2">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-3 hover:bg-brand-700 transition">
                    <Save size={18} /> {hasProfile ? 'Update Profile' : 'Create Profile'}
                  </button>
                </div>
              </form>

            </section>

            <section className="space-y-6">
              {!profileData ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft text-slate-500">
                  No profile created yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {renderRecordList(
                    'Degrees',
                    degrees,
                    (degree) => (
                      <div key={degree.id || `${degree.title}-${degree.university}`} className="rounded-xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{degree.title}</p>
                            <p className="text-sm text-slate-600">{degree.university || 'University not added'}</p>
                          </div>
                          <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-1 rounded-full">Degree</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">Completed:</span> {formatDate(degree.completion_date)}</p>
                          <p className="break-all"><span className="font-semibold text-slate-700">Credential:</span> {degree.url || 'Not added'}</p>
                        </div>
                      </div>
                    ),
                    'Add your degree to show your academic background here.',
                    'Add Degree',
                    () => openModal('degree')
                  )}

                  {renderRecordList(
                    'Certifications',
                    certifications,
                    (certification) => (
                      <div key={certification.id || `${certification.title}-${certification.issuer}`} className="rounded-xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{certification.title}</p>
                            <p className="text-sm text-slate-600">{certification.issuer || 'Issuer not added'}</p>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Certification</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">Completed:</span> {formatDate(certification.completion_date)}</p>
                          <p className="break-all"><span className="font-semibold text-slate-700">Credential:</span> {certification.url || 'Not added'}</p>
                        </div>
                      </div>
                    ),
                    'Add certifications to highlight your professional development.',
                    'Add Certification',
                    () => openModal('certification')
                  )}

                  {renderRecordList(
                    'Licences',
                    licences,
                    (licence) => (
                      <div key={licence.id || `${licence.title}-${licence.issuing_body}`} className="rounded-xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{licence.title}</p>
                            <p className="text-sm text-slate-600">{licence.issuing_body || 'Issuing body not added'}</p>
                          </div>
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Licence</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">Issued:</span> {formatDate(licence.completion_date)}</p>
                          <p className="break-all"><span className="font-semibold text-slate-700">Credential:</span> {licence.url || 'Not added'}</p>
                        </div>
                      </div>
                    ),
                    'Add licences to show your qualifications or authorisations.',
                    'Add Licence',
                    () => openModal('licence')
                  )}

                  {renderRecordList(
                    'Courses',
                    courses,
                    (course) => (
                      <div key={course.id || `${course.title}-${course.provider}`} className="rounded-xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{course.title}</p>
                            <p className="text-sm text-slate-600">{course.provider || 'Provider not added'}</p>
                          </div>
                          <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-1 rounded-full">Course</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">Completed:</span> {formatDate(course.completion_date)}</p>
                          <p className="break-all"><span className="font-semibold text-slate-700">Credential:</span> {course.url || 'Not added'}</p>
                        </div>
                      </div>
                    ),
                    'Add courses to show your recent learning and upskilling.',
                    'Add Course',
                    () => openModal('course')
                  )}

                  {renderRecordList(
                    'Employment',
                    employments,
                    (employment) => (
                      <div key={employment.id || `${employment.company}-${employment.role}`} className="rounded-xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{employment.role}</p>
                            <p className="text-sm text-slate-600">{employment.company || 'Company not added'}</p>
                          </div>
                          <span className="text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-1 rounded-full">Job</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <p><span className="font-semibold text-slate-700">Industry:</span> {employment.industry || 'Not added'}</p>
                          <p><span className="font-semibold text-slate-700">Location:</span> {employment.location || 'Not added'}</p>
                          <p><span className="font-semibold text-slate-700">Start:</span> {formatDate(employment.start_date)}</p>
                          <p><span className="font-semibold text-slate-700">End:</span> {formatDate(employment.end_date)}</p>
                        </div>
                      </div>
                    ),
                    'Add employment history to align your experience.',
                    'Add Employment',
                    () => openModal('employment')
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{modalTitleMap[activeModal]}</h3>
                <p className="mt-1 text-sm text-slate-500">{modalDescriptionMap[activeModal]}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {activeModal === 'degree' && (
              <form className="space-y-3" onSubmit={addDegree}>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={degreeForm.title} onChange={(e) => setDegreeForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">University</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={degreeForm.university} onChange={(e) => setDegreeForm((p) => ({ ...p, university: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Credential URL</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={degreeForm.url} onChange={(e) => setDegreeForm((p) => ({ ...p, url: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Completed Date</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="date" value={degreeForm.completion_date} onChange={(e) => setDegreeForm((p) => ({ ...p, completion_date: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"><Plus size={16} /> Add Degree</button>
                </div>
              </form>
            )}

            {activeModal === 'certification' && (
              <form className="space-y-3" onSubmit={addCertification}>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={certificationForm.title} onChange={(e) => setCertificationForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Issuer</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={certificationForm.issuer} onChange={(e) => setCertificationForm((p) => ({ ...p, issuer: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Credential URL</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={certificationForm.url} onChange={(e) => setCertificationForm((p) => ({ ...p, url: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Completed Date</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="date" value={certificationForm.completion_date} onChange={(e) => setCertificationForm((p) => ({ ...p, completion_date: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"><Plus size={16} /> Add Certification</button>
                </div>
              </form>
            )}

            {activeModal === 'licence' && (
              <form className="space-y-3" onSubmit={addLicence}>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={licenceForm.title} onChange={(e) => setLicenceForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Issuing body</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={licenceForm.issuing_body} onChange={(e) => setLicenceForm((p) => ({ ...p, issuing_body: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Credential URL</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={licenceForm.url} onChange={(e) => setLicenceForm((p) => ({ ...p, url: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Issued Date</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="date" value={licenceForm.completion_date} onChange={(e) => setLicenceForm((p) => ({ ...p, completion_date: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"><Plus size={16} /> Add Licence</button>
                </div>
              </form>
            )}

            {activeModal === 'course' && (
              <form className="space-y-3" onSubmit={addCourse}>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={courseForm.title} onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Provider</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={courseForm.provider} onChange={(e) => setCourseForm((p) => ({ ...p, provider: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Credential URL</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={courseForm.url} onChange={(e) => setCourseForm((p) => ({ ...p, url: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Completed Date</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="date" value={courseForm.completion_date} onChange={(e) => setCourseForm((p) => ({ ...p, completion_date: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"><Plus size={16} /> Add Course</button>
                </div>
              </form>
            )}

            {activeModal === 'employment' && (
              <form className="space-y-3" onSubmit={addEmployment}>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Company</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={employmentForm.company} onChange={(e) => setEmploymentForm((p) => ({ ...p, company: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" value={employmentForm.role} onChange={(e) => setEmploymentForm((p) => ({ ...p, role: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Industry</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    value={employmentForm.industry}
                    onChange={(e) => setEmploymentForm((p) => ({ ...p, industry: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    value={employmentForm.location}
                    onChange={(e) => setEmploymentForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Sri Lanka: City name | Other countries: Country name"
                    required
                  />
                  <p className="text-xs text-slate-500">For Sri Lanka enter city (e.g. Colombo). Otherwise enter country name.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Start Date</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="date" value={employmentForm.start_date} onChange={(e) => setEmploymentForm((p) => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">End Date</label>
                  <input className="w-full rounded-xl border border-slate-300 px-4 py-3" type="date" value={employmentForm.end_date} onChange={(e) => setEmploymentForm((p) => ({ ...p, end_date: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"><Plus size={16} /> Add Employment</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
