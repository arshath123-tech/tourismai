import React, { useState } from 'react';
import { Search, Compass, BookmarkPlus, Check, Sparkles, AlertCircle, FileText, Globe, Layers, MapPin } from 'lucide-react';
import { fetchTravelResearch, addSavedDestinationApi } from '../services/api';
import { TravelResearchResult, User } from '../types';
import { WeatherNewsTicker } from './WeatherNewsTicker';
import { DestinationAutocomplete } from './DestinationAutocomplete';
import { FormattedMarkdown } from './FormattedMarkdown';
import { InteractiveMapView } from './InteractiveMapView';

interface TravelResearchTabProps {
  user: User | null;
  activeCountry: string;
  onOpenAuth: () => void;
  activeDestination?: string;
  onDestinationChange?: (dest: string) => void;
}

export function TravelResearchTab({
  user,
  activeCountry,
  onOpenAuth,
  activeDestination = 'Tokyo, Japan',
  onDestinationChange
}: TravelResearchTabProps) {
  const [destination, setDestination] = useState(activeDestination);
  const [travelStyle, setTravelStyle] = useState<'Solo' | 'Family' | 'Business' | 'Backpacker' | 'Luxury'>(
    user?.travelStyle || 'Solo'
  );

  const handleDestinationUpdate = (newDest: string, autoSearch = false) => {
    setDestination(newDest);
    onDestinationChange?.(newDest);
    setResult(null); // Clear previous response
    if (autoSearch && newDest.trim()) {
      handleSearch(newDest);
    }
  };

  React.useEffect(() => {
    if (activeDestination && activeDestination !== destination) {
      setDestination(activeDestination);
      setResult(null);
      handleSearch(activeDestination);
    }
  }, [activeDestination]);
  const [countryContext, setCountryContext] = useState(activeCountry);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TravelResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const quickDestinations = [
    'Gujarat, India',
    'Statue of Unity, India',
    'Tokyo, Japan',
    'Taj Mahal (Agra), India',
    'Paris, France',
    'New Delhi, India',
    'Kyoto, Japan',
    'Dubai, UAE'
  ];

  const handleSearch = async (targetDest?: string) => {
    const queryDest = targetDest || destination;
    if (!queryDest.trim()) return;

    setError(null);
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetchTravelResearch({
        destination: queryDest,
        travelStyle,
        countryContext: user?.nationality || activeCountry,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI Travel Intelligence.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDestination = async () => {
    if (!result) return;
    try {
      await addSavedDestinationApi({
        destination: result.destination,
        country: result.primaryCountryContext || 'Global',
        safetyRating: 'LOW',
        notes: `Researched via Spring AI for ${result.travelStyle} style traveller.`,
        tags: [result.travelStyle, 'AI Researched']
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save destination');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
          <Compass className="w-96 h-96 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tourism AI Travel Assistant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart Travel Guide & Destination Insights
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Personalized insights tailored to: <strong className="text-white">Your Travel Style</strong> + <strong className="text-white">Origin Country</strong> + <strong className="text-white">Live Weather</strong> + <strong className="text-white">Travel News</strong> + <strong className="text-white">Local Safety</strong>.
          </p>

          {/* Controls Form */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <DestinationAutocomplete
                  value={destination}
                  onChange={(val) => handleDestinationUpdate(val)}
                  onSelect={(place) => {
                    const placeName = `${place.name}, ${place.country}`;
                    handleDestinationUpdate(placeName);
                    handleSearch(placeName);
                  }}
                  placeholder="Type destination (e.g., Tokyo, Japan or Taj Mahal)..."
                />
              </div>

              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as any)}
                className="px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Solo">Solo Travel</option>
                <option value="Family">Family Travel</option>
                <option value="Business">Business Travel</option>
                <option value="Backpacker">Backpacker / Budget</option>
                <option value="Luxury">Luxury Travel</option>
              </select>

              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Preparing Guide...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Explore Destination</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Destination Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-semibold">Popular Queries:</span>
              {quickDestinations.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    handleDestinationUpdate(d);
                    handleSearch(d);
                  }}
                  className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700/60"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Weather & News Telemetry Ticker */}
      <WeatherNewsTicker location={destination} />

      {/* Interactive Map Component for Searched Destination */}
      <InteractiveMapView
        destination={destination || 'Gujarat, India'}
        onPinLocationSelect={(pinName) => {
          setDestination(pinName);
          handleSearch(pinName);
        }}
      />

      {/* Result Display */}
      {result && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Research Report: {result.destination}
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {result.wordCount} Words Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Profile Context: <strong>{result.travelStyle}</strong></span>
                <span>•</span>
                <span>Origin Context: <strong>{result.primaryCountryContext}</strong></span>
                <span>•</span>
                <span>Powered by Tourism AI</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDestination}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved to Bookmarks!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Bookmark Destination</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Formatted Travel Guide Report */}
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 font-sans text-sm text-slate-800">
            <FormattedMarkdown content={result.rawMarkdownText} />
          </div>

          {/* Travel Guide summary footer */}
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-medium">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Comprehensive travel summary crafted by Tourism AI.</span>
            </span>
            <span className="font-mono bg-indigo-200/60 px-2 py-0.5 rounded font-bold text-indigo-900">
              {result.wordCount} Words
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
