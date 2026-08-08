import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { CountryContextBanner } from './components/CountryContextBanner';
import { AuthModal } from './components/AuthModal';
import { TravelResearchTab } from './components/TravelResearchTab';
import { SafetyAssessmentTab } from './components/SafetyAssessmentTab';
import { AiAssistantTab } from './components/AiAssistantTab';
import { SavedDestinationsTab } from './components/SavedDestinationsTab';
import { AdminDashboardTab } from './components/AdminDashboardTab';
import Particles from './components/Particles';
import { fetchMeApi, setAuthToken } from './services/api';
import { User } from './types';
import { DEFAULT_GUEST_COUNTRY } from './data/countries';
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeCountry, setActiveCountry] = useState<string>(DEFAULT_GUEST_COUNTRY);
  const [activeDestination, setActiveDestination] = useState<string>('Tokyo, Japan');
  const [activeTab, setActiveTab] = useState<string>('research');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Verify authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetchMeApi();
        if (res.isAuthenticated && res.user) {
          setUser(res.user);
          setActiveCountry(res.user.nationality || DEFAULT_GUEST_COUNTRY);
        } else {
          setUser(null);
          setActiveCountry(DEFAULT_GUEST_COUNTRY);
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
        setUser(null);
        setActiveCountry(DEFAULT_GUEST_COUNTRY);
      }
    }
    checkAuth();
  }, []);

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    if (loggedUser.nationality) {
      setActiveCountry(loggedUser.nationality);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setActiveCountry(DEFAULT_GUEST_COUNTRY);
  };

  const handleSelectSavedDestination = (destName: string) => {
    setActiveDestination(destName);
    setActiveTab('research');
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* React Bits Ambient Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50">
        <Particles
          particleColors={['#6366f1', '#a855f7', '#38bdf8', '#fbbf24']}
          particleCount={150}
          particleSpread={12}
          speed={0.15}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Header */}
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Mandatory Country Context & Guest Mode Banner */}
        <CountryContextBanner
          user={user}
          activeCountry={activeCountry}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeTab === 'research' && (
            <TravelResearchTab
              user={user}
              activeCountry={activeCountry}
              activeDestination={activeDestination}
              onDestinationChange={setActiveDestination}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}

          {activeTab === 'assessment' && (
            <SafetyAssessmentTab
              user={user}
              activeCountry={activeCountry}
              activeDestination={activeDestination}
              onDestinationChange={setActiveDestination}
            />
          )}

          {activeTab === 'chat' && (
            <AiAssistantTab
              user={user}
              activeCountry={activeCountry}
              activeDestination={activeDestination}
              onDestinationChange={setActiveDestination}
            />
          )}

          {activeTab === 'saved' && (
            <SavedDestinationsTab
              user={user}
              onSelectDestination={handleSelectSavedDestination}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardTab
              currentUser={user}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          )}
        </main>

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Footer */}
        <footer className="bg-slate-950/90 text-slate-400 py-6 border-t border-slate-800 text-xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Tourism AI</span>
              <span>• Smart Travel & Safety Advisor</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
              <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-indigo-300">Tailored Guidance</span>
              <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-emerald-300">Origin Country: {activeCountry}</span>
              <span className="bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-amber-300 font-semibold">Interactive Travel Assistant</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
