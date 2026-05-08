import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Key,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  X,
  PencilLine,
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import { apiKeyAPI } from '../services/api';

const availablePermissions = [
  { id: 'read:alumni', label: 'Read Alumni Data', description: 'Access to alumni profiles and information' },
  { id: 'read:analytics', label: 'Read Analytics', description: 'Access to analytics and reports' },
  { id: 'read:alumni_of_day', label: 'Read Alumni of Day', description: 'Access to featured alumni display' },
  { id: 'read:donations', label: 'Read Donations', description: 'Access to donation data' },
];

const emptyForm = { name: '', permissions: [] };

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

const maskApiKey = (value) => {
  if (!value) return '';
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}${'*'.repeat(Math.max(value.length - 12, 6))}${value.slice(-4)}`;
};

const ApiKeysPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [visibleSecret, setVisibleSecret] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const res = await apiKeyAPI.getApiKeys();
      setApiKeys(res.data?.keys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      // toast.error(error.response?.data?.message || 'Failed to load API keys');
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const totalRequests = useMemo(
    () => apiKeys.reduce((sum, item) => sum + Number(item.usageCount || 0), 0),
    [apiKeys]
  );

  const activeKeys = useMemo(
    () => apiKeys.filter((item) => item.status === 'active').length,
    [apiKeys]
  );

  const revokedKeys = useMemo(
    () => apiKeys.filter((item) => item.status === 'revoked').length,
    [apiKeys]
  );

  const lastUsedKey = useMemo(() => {
    return [...apiKeys]
      .filter((item) => item.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt))[0] || null;
  }, [apiKeys]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedKey(null);
    setGeneratedKey(null);
    setVisibleSecret(true);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (apiKey) => {
    setModalMode('edit');
    setSelectedKey(apiKey);
    setGeneratedKey(null);
    setVisibleSecret(false);
    setFormData({
      name: apiKey.name || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSaving(false);
    setSelectedKey(null);
    setGeneratedKey(null);
    setVisibleSecret(false);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'create') {
        const res = await apiKeyAPI.createApiKey(formData);
        setGeneratedKey(res.data || null);
        toast.success('API key generated successfully');
        await fetchApiKeys();
        return;
      }

      await apiKeyAPI.updateApiKey(selectedKey.id, formData);
      toast.success('API key updated successfully');
      await fetchApiKeys();
      closeModal();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error(error.response?.data?.message || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeyAPI.deleteApiKey(id);
      toast.success('API key deleted successfully');
      await fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error(error.response?.data?.message || 'Failed to delete API key');
    }
  };

  const revokeKey = async (id) => {
    if (!window.confirm('Revoke this API key? It will stop working immediately.')) {
      return;
    }

    try {
      await apiKeyAPI.revokeApiKey(id);
      toast.success('API key revoked successfully');
      await fetchApiKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast.error(error.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const copyToClipboard = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.info('Copied to clipboard');
    } catch {
      toast.error('Unable to copy to clipboard');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-7 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">API Key Management</h3>
                <button
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
                >
                  <Plus size={18} /> Generate API Key
                </button>
              </div>
              <div className="w-full lg:w-64 h-28 rounded-2xl bg-white/60 border border-brand-100 grid place-items-center text-brand-500">
                <Key size={56} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-black tracking-tight text-slate-900">All API Keys ({apiKeys.length})</h3>
                  <p className="text-sm text-slate-500">{activeKeys} active, {revokedKeys} revoked</p>
                </div>
                <button
                  onClick={fetchApiKeys}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              {loading ? (
                <div className="p-10 grid place-items-center text-slate-500">
                  <Loader2 className="animate-spin text-brand-600 mb-3" size={28} />
                  Loading API keys...
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <Key className="mx-auto mb-3 text-slate-300" size={40} />
                  <p className="font-semibold text-slate-700">No API keys found</p>
                  <p className="mt-1">Generate your first key to get started.</p>
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="px-6 py-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition">
                    <div className="grid grid-cols-1 lg:grid-cols-[2.4fr_1fr_1.3fr_1fr_auto] gap-4 items-center">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 grid place-items-center">
                          <Key size={24} className="text-brand-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xl font-bold text-slate-900">{apiKey.name}</p>
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                apiKey.status === 'revoked'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {apiKey.status || 'active'}
                            </span>
                          </div>

                          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Secret key</p>
                            <p className="text-sm text-slate-600">Stored securely. Regenerate to view a new secret once.</p>
                          </div>

                          <p className="text-sm text-slate-500 mt-2">Created: {formatDateTime(apiKey.createdAt)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Usage Count</p>
                        <p className="text-2xl font-extrabold text-slate-900">{Number(apiKey.usageCount || 0).toLocaleString()}</p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Last Used</p>
                        <p className="font-semibold text-slate-800">{formatDateTime(apiKey.lastUsedAt)}</p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">State</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${apiKey.status === 'revoked' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {apiKey.status || 'active'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(apiKey)}
                          className="w-10 h-10 rounded-xl border border-slate-200 grid place-items-center text-slate-500 hover:text-brand-700 hover:border-brand-300"
                          title="Edit key"
                        >
                          <PencilLine size={18} />
                        </button>
                        <button
                          onClick={() => revokeKey(apiKey.id)}
                          className="w-10 h-10 rounded-xl border border-amber-200 grid place-items-center text-amber-600 hover:bg-amber-50"
                          title="Revoke key"
                        >
                          <AlertTriangle size={18} />
                        </button>
                        <button
                          onClick={() => deleteKey(apiKey.id)}
                          className="w-10 h-10 rounded-xl border border-rose-200 grid place-items-center text-rose-500 hover:bg-rose-50"
                          title="Delete key"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft max-w-2xl w-full p-6 border border-slate-200">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{modalMode === 'create' ? 'Generate API Key' : 'Update API Key'}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {modalMode === 'create'
                    ? 'The secret is shown only once after creation.'
                    : 'Update the key name and permissions stored in the database.'}
                </p>
              </div>
              <button onClick={closeModal} className="w-10 h-10 rounded-xl border border-slate-200 grid place-items-center text-slate-500 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            {generatedKey && modalMode === 'create' && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
                  <CheckCircle2 size={18} /> Generated key
                </div>
                <div className="rounded-lg bg-white border border-emerald-100 p-3 flex items-center justify-between gap-3">
                  <code className={`text-sm font-mono break-all ${visibleSecret ? 'text-slate-800' : 'text-slate-500'}`}>
                    {visibleSecret ? generatedKey.key : maskApiKey(generatedKey.key)}
                  </code>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setVisibleSecret((current) => !current)}
                      className="w-10 h-10 rounded-lg border border-slate-200 grid place-items-center text-slate-500 hover:text-brand-700"
                      title="Toggle secret"
                    >
                      {visibleSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedKey.key)}
                      className="px-3 py-2 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Key Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g., Analytics Dashboard"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (modalMode === 'create' && !!generatedKey)}
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed font-semibold transition-colors inline-flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : modalMode === 'create' && generatedKey ? 'Key Generated' : modalMode === 'create' ? 'Create Key' : 'Update Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeysPage;
