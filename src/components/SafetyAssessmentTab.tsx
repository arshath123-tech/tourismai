import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, Lock, CheckCircle2, FileText, Sparkles, RefreshCw, MapPin } from 'lucide-react';
import { fetchSafetyAssessment } from '../services/api';
import { SafetyAssessmentResult, User } from '../types';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { FormattedMarkdown } from './FormattedMarkdown';
import { InteractiveMapView } from './InteractiveMapView';

interface SafetyAssessmentTabProps {
  user: User | null;
  activeCountry: string;
  activeDestination?: string;
  onDestinationChange?: (dest: string) => void;
}

export function SafetyAssessmentTab({
  user,
  activeCountry,
  activeDestination = 'Kyoto, Japan',
  onDestinationChange
}: SafetyAssessmentTabProps) {
  const [destination, setDestination] = useState(activeDestination);
  const [itineraryDetails, setItineraryDetails] = useState('Night walking tour, metro travel & local street food exploration');

  const handleDestinationUpdate = (newDest: string, autoAssess = false) => {
    setDestination(newDest);
    onDestinationChange?.(newDest);
    setResult(null); // Clear previous response when destination changes
    if (autoAssess && newDest.trim()) {
      handleAssessment(newDest);
    }
  };

  React.useEffect(() => {
    if (activeDestination && activeDestination !== destination) {
      setDestination(activeDestination);
      setResult(null);
      handleAssessment(activeDestination);
    }
  }, [activeDestination]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickPlaces = [
    'Gujarat, India',
    'Taj Mahal (Agra), India',
    'New Delhi, India',
    'Kyoto, Japan',
    'Tokyo, Japan',
    'Paris, France',
    'Dubai, United Arab Emirates'
  ];

  const handleAssessment = async (targetDest?: string) => {
    const destToUse = targetDest || destination;
    if (!destToUse.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetchSafetyAssessment({
        destination: destToUse,
        itineraryDetails
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Safety assessment generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tourism AI Safety & Security Check</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Travel Safety & Advisory Check
          </h1>
          <p className="text-sm text-slate-300">
            Type or search any destination below to view suggestions and generate a tailored risk assessment for <strong className="text-white">{user?.nationality || activeCountry}</strong> origin travellers.
          </p>
        </div>

        {/* Form Inputs */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Destination / Route (Type to see suggestions)
            </label>
            <DestinationAutocomplete
              value={destination}
              onChange={(val) => handleDestinationUpdate(val)}
              onSelect={(place) => {
                const placeName = `${place.name}, ${place.country}`;
                handleDestinationUpdate(placeName, true);
              }}
              darkTheme={true}
              placeholder="Type destination (e.g., Tokyo, Japan or New Delhi)..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Specific Itinerary & Activity Scope
            </label>
            <input
              type="text"
              value={itineraryDetails}
              onChange={(e) => setItineraryDetails(e.target.value)}
              placeholder="e.g. Night walk, metro ride, local festival"
              className="w-full px-3.5 py-2.5 bg-slate-900 text-white rounded-xl border border-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Quick Place Chips */}
          <div className="sm:col-span-2 flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <MapPin className="w-3 h-3 text-indigo-400" /> Popular Places:
            </span>
            {quickPlaces.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  handleDestinationUpdate(p);
                  handleAssessment(p);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium ${
                  destination === p
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              onClick={() => handleAssessment()}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Safety Factors...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Check Travel Safety</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Interactive Map Component for Safety Scope */}
      <InteractiveMapView
        destination={destination || 'Gujarat, India'}
        onPinLocationSelect={(pinName) => {
          setDestination(pinName);
          handleAssessment(pinName);
        }}
      />

      {/* Assessment Output Display */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Security Assessment: {result.destination}
                </h2>
                <p className="text-xs text-slate-500">
                  Target Nationality Context: <strong>{user?.nationality || activeCountry}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                result.riskRating === 'LOW'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : result.riskRating === 'MEDIUM'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                Risk Rating: {result.riskRating}
              </span>
              <span className="bg-slate-100 text-slate-700 font-extrabold text-xs px-2.5 py-1 rounded-full border border-slate-300">
                {result.wordCount} Words
              </span>
            </div>
          </div>

          {/* Formatted Output */}
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-sm text-slate-800">
            <FormattedMarkdown content={result.formattedOutput} />
          </div>

          {/* Quick reference cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Scams */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Regional Scam Warnings
              </div>
              <ul className="space-y-1 text-amber-950 font-medium">
                {result.regionalScams?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Emergency Numbers */}
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 text-xs space-y-2">
              <div className="font-bold text-indigo-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-indigo-600" />
                  Emergency Contact Protocols
                </span>
                <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                  {result.destination}
                </span>
              </div>
              <div className="space-y-1.5 text-indigo-950 pt-1">
                {Object.entries(result.emergencyContacts || {}).map(([key, num]) => (
                  <div key={key} className="flex justify-between items-center bg-white p-2 rounded-lg border border-indigo-100 shadow-xs">
                    <span className="font-semibold text-slate-700">{key}:</span>
                    <span className="font-mono font-bold text-indigo-700 text-right">{num}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Tips */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                Digital & Physical Privacy Rules
              </div>
              <ul className="space-y-1 text-slate-300">
                {result.digitalPrivacyTips?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-emerald-400">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
