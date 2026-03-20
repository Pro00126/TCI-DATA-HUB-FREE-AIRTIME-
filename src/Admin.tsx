import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, Plus, Link as LinkIcon, Users, RefreshCw, Trash2 } from 'lucide-react';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [password, setPassword] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New Campaign Form
  const [newRefCode, setNewRefCode] = useState('');
  const [newMaxUses, setNewMaxUses] = useState(10);
  const [newAmount, setNewAmount] = useState(100);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  const fetchData = async () => {
    try {
      const [campRes, claimsRes] = await Promise.all([
        fetch('/api/admin/campaigns', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/claims', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (campRes.status === 401) {
        handleLogout();
        return;
      }

      setCampaigns(await campRes.json());
      setClaims(await claimsRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ref_code: newRefCode, max_uses: newMaxUses, amount: newAmount })
      });
      if (res.ok) {
        setNewRefCode('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  const toggleCampaignStatus = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Create Campaign Form */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> New Link
            </h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference Code</label>
                <input
                  type="text"
                  value={newRefCode}
                  onChange={(e) => setNewRefCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. PROMO2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses (People)</label>
                <input
                  type="number"
                  min="1"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount per Use (₦)</label>
                <input
                  type="number"
                  min="10"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Create Link
              </button>
            </form>
          </div>

          {/* Campaigns List */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-500" /> Active Links
              </h2>
              <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-medium">Ref Code</th>
                    <th className="pb-3 font-medium">Uses</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {campaigns.map(camp => (
                    <tr key={camp.id} className="text-slate-700">
                      <td className="py-3 font-medium text-slate-900">{camp.ref_code}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${Math.min(100, (camp.current_uses / camp.max_uses) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs">{camp.current_uses}/{camp.max_uses}</span>
                        </div>
                      </td>
                      <td className="py-3">₦{camp.amount}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${camp.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {camp.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => toggleCampaignStatus(camp.id, camp.is_active)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          {camp.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">No links created yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Claims */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Recent Claims
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Network</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Ref Code</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {claims.map(claim => (
                  <tr key={claim.id} className="text-slate-700">
                    <td className="py-3 font-medium">{claim.phone}</td>
                    <td className="py-3">{claim.network}</td>
                    <td className="py-3">₦{claim.amount}</td>
                    <td className="py-3">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{claim.ref_code || '-'}</span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(claim.timestamp).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${claim.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {claims.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">No claims yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
