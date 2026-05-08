import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CalendarDays, WalletCards, Crown } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import { bidAPI } from '../services/api';



const BidsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bids, setBids] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [monthlyBidsCount, setMonthlyBidsCount] = useState(0);
  const [monthlyBidLimit, setMonthlyBidLimit] = useState(3);
  const [formData, setFormData] = useState({
    amount: '',
  });

  const fetchBids = async () => {
    try {
      const [bidsRes, limitRes] = await Promise.all([
        bidAPI.getBids(),
        bidAPI.getMonthlyLimit(),
      ]);

      const bidsData = Array.isArray(bidsRes.data)
        ? bidsRes.data
        : Array.isArray(bidsRes.data?.bids)
          ? bidsRes.data.bids
          : [];
      setBids(bidsData);
      const now = new Date();
      const thisMonthBids = bidsData.filter((b) => {
        if (!b.createdAt) return false;
        const created = new Date(b.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;
      setMonthlyBidsCount(thisMonthBids);
      setMonthlyBidLimit(typeof limitRes.data?.limit === 'number' ? limitRes.data.limit : 3);
    } catch (error) {
      console.error('Error fetching bids:', error);
      // toast.error(error.response?.data?.message || 'Failed to load bids');
      setBids([]);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleOpenModal = (bid = null) => {
    if (bid) {
      setEditingId(bid.id);
      setFormData({ amount: Math.round(bid.amount) });
    } else {
      setEditingId(null);
      setFormData({ amount: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await bidAPI.updateBid(editingId, { amount: parseFloat(formData.amount) });
        toast.success('Bid updated successfully');
      } else {
        await bidAPI.createBid({ amount: parseFloat(formData.amount) });
        toast.success('Bid placed successfully');
      }
      setShowModal(false);
      setFormData({ amount: '' });
      setEditingId(null);
      fetchBids();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bid');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this bid?')) {
      try {
        await bidAPI.deleteBid(id);
        toast.info('Bid deleted');
        fetchBids();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete bid');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      winning: 'bg-sky-100 text-sky-700',
      losing: 'bg-rose-100 text-rose-700',
      won: 'bg-emerald-100 text-emerald-700',
      lost: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
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
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Blind Bidding System</h2>
                </div>
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700"
                >
                  <Plus size={18} /> Place Bid
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 grid place-items-center mb-3"><CalendarDays size={20} /></div>
                <p className="text-sm text-slate-500">Monthly Bids Used</p>
                <p className="text-4xl font-black text-slate-900">{monthlyBidsCount}/{monthlyBidLimit}</p>
              </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 grid place-items-center mb-3"><Crown size={20} /></div>
                <p className="text-sm text-slate-500">Active Bids</p>
                <p className="text-4xl font-black text-slate-900">{bids.filter((b) => b.status === 'pending' || b.status === 'winning' || b.status === 'losing').length}</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center mb-3"><WalletCards size={20} /></div>
                <p className="text-sm text-slate-500">Total Invested</p>
                <p className="text-4xl font-black text-slate-900">${Math.round(bids.reduce((sum, b) => sum + Number(b.amount || 0), 0)).toLocaleString(undefined)}</p>
              </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4">Your Bids ({bids.length})</h3>
              {bids.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
                  No bids yet. Click "Place Bid" to create your first bid.
                </div>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid) => (
                  <article key={bid.id} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-2xl font-black text-slate-900">${Math.round(bid.amount).toLocaleString()}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)}`}>
                            {bid.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Target: {bid.targetDate || 'N/A'} | Created: {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(bid.status === 'pending' || bid.status === 'winning' || bid.status === 'losing') && (
                          <button onClick={() => handleOpenModal(bid)} className="w-10 h-10 rounded-xl border border-slate-200 grid place-items-center text-sky-600 hover:bg-sky-50">
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(bid.id)} className="w-10 h-10 rounded-xl border border-rose-200 grid place-items-center text-rose-600 hover:bg-rose-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 mb-4">{editingId ? 'Increase Bid' : 'Place New Bid'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bid Amount ($)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-11 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 h-11 rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-semibold">
                  {editingId ? 'Update Bid' : 'Place Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidsPage;
