import React from 'react';
import { Compass, Shield, User as UserIcon, LogOut, Settings, MessageSquare, Bookmark, SearchCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function Navbar({ user, activeTab, setActiveTab, onOpenAuth, onLogout }: NavbarProps) {
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <header className="bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tag */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('research')}
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition">
                  Tourism <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-300">AI</span>
                </span>
                <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/60 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-inner">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Travel Guide
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                Smart Travel Assistant & Real-Time Safety Guide
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'research'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <SearchCheck className="w-4 h-4" />
              <span>Research</span>
            </button>

            <button
              onClick={() => setActiveTab('assessment')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'assessment'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Safety Assessment</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Places</span>
            </button>

            {/* Admin Control Plane button (Only visible to ROLE_ADMIN) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  activeTab === 'admin'
                    ? 'bg-purple-950 text-amber-300 border-purple-500/80 shadow-lg shadow-purple-900/40'
                    : 'bg-purple-950/40 text-purple-300 border-purple-800/50 hover:bg-purple-900/60 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Admin</span>
                <span className="bg-purple-800 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-extrabold">
                  ADMIN
                </span>
              </button>
            )}
          </nav>

          {/* User Auth Profile Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 pl-3 pr-1.5 rounded-2xl border border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-extrabold text-white">{user.fullName}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase ${
                      user.role === 'ROLE_ADMIN'
                        ? 'bg-purple-900/80 text-amber-300 border-purple-500/60'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-600/60'
                    }`}>
                      {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Traveller'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {user.nationality || 'India'}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>

                <button
                  onClick={onLogout}
                  title="Log Out"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-red-900/50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition hover:scale-105"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Dock */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/80 text-[11px] font-extrabold">
          <button
            onClick={() => setActiveTab('research')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'research' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <SearchCheck className="w-4 h-4" />
            <span>Research</span>
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'assessment' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Safety</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'chat' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'saved' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center gap-1 transition ${activeTab === 'admin' ? 'text-amber-400' : 'text-slate-400'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

