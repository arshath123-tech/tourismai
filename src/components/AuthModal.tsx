import React, { useState } from 'react';
import { User, Shield, UserCheck, Lock, Globe, Sparkles, X } from 'lucide-react';
import { COUNTRIES, DEFAULT_GUEST_COUNTRY } from '../data/countries';
import { loginApi, registerApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regNationality, setRegNationality] = useState(DEFAULT_GUEST_COUNTRY);
  const [regTravelStyle, setRegTravelStyle] = useState<'Solo' | 'Family' | 'Business' | 'Backpacker' | 'Luxury'>('Solo');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginApi(loginUsername, loginPassword);
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regNationality) {
      setError('Registration CANNOT be submitted without selecting a valid country.');
      return;
    }
    setLoading(true);
    try {
      const data = await registerApi({
        username: regUsername,
        password: regPassword,
        fullName: regFullName || regUsername,
        nationality: regNationality,
        travelStyle: regTravelStyle,
      });
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await loginApi(username, pass);
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-lg tracking-tight">Smart Tourism AI</span>
          </div>
          <p className="text-xs text-slate-300">
            Spring AI 1.0.0 & Spring Security JWT Protected Portal
          </p>
          
          {/* Tabs */}
          <div className="flex mt-6 bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              {/* Quick Demo Buttons */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 mb-2 uppercase tracking-wider text-center">
                  Quick Demo One-Click Logins
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin', 'adminpassword123')}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Login as Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('traveller1', 'password123')}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Traveller (India)</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Choose username"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set password"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* MANDATORY NATIONALITY / COUNTRY SELECTOR */}
              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-amber-700" />
                    Nationality / Primary Country (MANDATORY)
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold uppercase">Required</span>
                </label>
                <select
                  required
                  value={regNationality}
                  onChange={(e) => setRegNationality(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name} ({c.region})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-800 mt-1">
                  Your primary country propagates across AI assessments, news & safety alerts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Travel Style
                </label>
                <select
                  value={regTravelStyle}
                  onChange={(e) => setRegTravelStyle(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Solo">Solo Traveller</option>
                  <option value="Family">Family Travel</option>
                  <option value="Business">Business Travel</option>
                  <option value="Backpacker">Backpacker / Budget</option>
                  <option value="Luxury">Luxury & Leisure</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Complete Registration (ROLE_TRAVELLER)'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
