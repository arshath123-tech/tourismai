import React from 'react';
import { Globe, Info, ShieldCheck } from 'lucide-react';
import { getCountryByName } from '../data/countries';
import { User } from '../types';

interface CountryContextBannerProps {
  user: User | null;
  activeCountry: string;
  onOpenAuth: () => void;
}

export function CountryContextBanner({ user, activeCountry, onOpenAuth }: CountryContextBannerProps) {
  const countryData = getCountryByName(activeCountry);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 border-b border-indigo-900/50 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Active Country Context info */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-base">
            {countryData?.flag || '🇮🇳'}
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-100">
              <span>Your Origin Country: <strong className="text-amber-300">{activeCountry}</strong></span>
              {countryData && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Safety Index: {countryData.safetyIndex}/100
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Customizing travel tips, weather, and safety guidance for travellers from {activeCountry}</span>
            </p>
          </div>
        </div>

        {/* Right: Guest or Authenticated Status */}
        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-200 text-[11px]">
                Guest Mode: Defaulted to <strong className="text-amber-300">India</strong>
              </span>
              <button
                onClick={onOpenAuth}
                className="ml-1 px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] rounded transition"
              >
                Set Nationality
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 text-[11px] bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Registered Traveller Context: <strong className="text-white">{user.fullName}</strong> ({user.nationality})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
