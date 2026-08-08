import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, ExternalLink, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { fetchSavedDestinationsApi, deleteSavedDestinationApi } from '../services/api';
import { SavedDestination, User } from '../types';

interface SavedDestinationsTabProps {
  user: User | null;
  onSelectDestination: (dest: string) => void;
}

export function SavedDestinationsTab({ user, onSelectDestination }: SavedDestinationsTabProps) {
  const [destinations, setDestinations] = useState<SavedDestination[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const list = await fetchSavedDestinationsApi();
      setDestinations(list);
    } catch (err) {
      console.error('Failed to load saved destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedDestinationApi(id);
      setDestinations((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to remove destination');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-extrabold tracking-tight">Saved Destinations & Itineraries</h1>
        </div>
        <p className="text-sm text-slate-300">
          Bookmarked global destinations with cached safety ratings, custom notes, and instant research links.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading saved places...</div>
      ) : destinations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Saved Destinations Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use the Travel Research tab to search for destinations and bookmark them to your personal itinerary database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{item.destination}</h3>
                      <p className="text-xs text-slate-500 font-medium">{item.country}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      item.safetyRating === 'LOW'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : item.safetyRating === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    Risk: {item.safetyRating}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{item.notes || 'No custom travel notes saved.'}"
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags?.map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectDestination(item.destination)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Research Now</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
