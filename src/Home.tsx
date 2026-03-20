/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NETWORKS = [
  { id: 'MTN', name: 'MTN', color: 'bg-yellow-400 text-black' },
  { id: 'GLO', name: 'GLO', color: 'bg-green-500 text-white' },
  { id: 'AIRTEL', name: 'Airtel', color: 'bg-red-500 text-white' },
  { id: '9MOBILE', name: '9mobile', color: 'bg-emerald-800 text-white' },
];

export default function App() {
  const [network, setNetwork] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefCode(ref);
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      setStatus('error');
      setMessage('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, network, refCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim airtime');
      }

      setStatus('success');
      setMessage(data.message || 'Airtime claimed successfully!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Free Airtime Claim</h1>
            <p className="text-neutral-500 text-sm">Enter your details below to claim your free airtime. One claim per number.</p>
          </div>

          <form onSubmit={handleClaim} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Select Network</label>
              <div className="grid grid-cols-2 gap-3">
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setNetwork(net.id)}
                    className={cn(
                      "py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border-2",
                      network === net.id 
                        ? "border-indigo-600 shadow-sm" 
                        : "border-neutral-100 hover:border-neutral-200 bg-neutral-50 text-neutral-600"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", net.color.split(' ')[0])} />
                      {net.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-neutral-700">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 08012345678"
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  maxLength={11}
                  disabled={status === 'success' || loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="refCode" className="text-sm font-medium text-neutral-700">Reference Code</label>
              <input
                type="text"
                id="refCode"
                value={refCode || ''}
                onChange={(e) => setRefCode(e.target.value)}
                placeholder="Enter your promo code"
                className="block w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                disabled={status === 'success' || loading}
              />
            </div>

            {status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={cn(
                  "p-4 rounded-xl flex items-start gap-3 text-sm",
                  status === 'success' ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                )}
              >
                {status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <p className="font-medium leading-relaxed">{message}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || status === 'success' || !phone}
              className={cn(
                "w-full py-3.5 px-4 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2",
                status === 'success' 
                  ? "bg-neutral-300 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : status === 'success' ? (
                'Airtime Claimed'
              ) : (
                'Claim Airtime'
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
          <p className="text-xs text-neutral-500">
            Powered by TCI Data Hub VTU API
          </p>
        </div>
      </motion.div>
    </div>
  );
}
