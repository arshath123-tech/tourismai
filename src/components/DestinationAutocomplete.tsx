import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ShieldCheck, Check, Globe, Loader2 } from 'lucide-react';
import { searchDestinations, DestinationPlace } from '../data/destinations';

interface DestinationAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (place: DestinationPlace) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  darkTheme?: boolean;
}

export function DestinationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Type any place worldwide (e.g., Gujarat, Tokyo, Paris)...',
  className = '',
  inputClassName = '',
  darkTheme = false
}: DestinationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPlaces, setFilteredPlaces] = useState<DestinationPlace[]>([]);
  const [remoteResults, setRemoteResults] = useState<DestinationPlace[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced Nominatim Geocoding for worldwide places
  useEffect(() => {
    const localMatches = searchDestinations(value);
    setFilteredPlaces(localMatches);

    if (!value || value.trim().length < 2) {
      setRemoteResults([]);
      setLoadingRemote(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingRemote(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          const mapped: DestinationPlace[] = data.map((item: any) => {
            const country = item.address?.country || 'Global';
            const countryCode = (item.address?.country_code || '').toUpperCase();
            // Flag helper
            let flag = '🌍';
            if (countryCode && countryCode.length === 2) {
              flag = countryCode
                .toUpperCase()
                .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
            }

            const displayName = item.name || item.display_name.split(',')[0];
            const region = item.address?.state || item.address?.region || country;

            return {
              name: displayName,
              country,
              flag,
              region,
              safetyRating: 'LOW',
              popularFor: item.display_name
            };
          });

          // Filter out duplicates that already exist in local matches
          const localNames = new Set(localMatches.map(m => m.name.toLowerCase()));
          const uniqueRemote = mapped.filter(r => !localNames.has(r.name.toLowerCase()));
          setRemoteResults(uniqueRemote);
        }
      } catch (err) {
        console.warn('Geocoding API failed fallback to local:', err);
      } finally {
        setLoadingRemote(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPlace = (place: DestinationPlace) => {
    const formatted = place.country && place.country !== 'Global' ? `${place.name}, ${place.country}` : place.name;
    onChange(formatted);
    if (onSelect) onSelect(place);
    setIsOpen(false);
  };

  const handleSelectCustom = () => {
    if (!value.trim()) return;
    const customPlace: DestinationPlace = {
      name: value.trim(),
      country: 'Global Destination',
      flag: '📍',
      region: 'Worldwide',
      safetyRating: 'LOW',
      popularFor: 'Custom searched location'
    };
    onChange(value.trim());
    if (onSelect) onSelect(customPlace);
    setIsOpen(false);
  };

  const combinedResults = [...filteredPlaces, ...remoteResults];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <MapPin className={`absolute left-3.5 w-4 h-4 pointer-events-none ${
          darkTheme ? 'text-indigo-400' : 'text-slate-400'
        }`} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSelectCustom();
            }
          }}
          placeholder={placeholder}
          className={
            inputClassName ||
            `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
              darkTheme
                ? 'bg-slate-900 text-white border-slate-700 focus:ring-indigo-400'
                : 'bg-white text-slate-900 border-slate-300 focus:ring-indigo-500'
            }`
          }
        />
        {loadingRemote && (
          <Loader2 className="absolute right-3 w-4 h-4 text-indigo-400 animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (value.trim().length > 0 || combinedResults.length > 0) && (
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 overflow-y-auto rounded-2xl shadow-2xl border ${
          darkTheme ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Header */}
          <div className={`px-3 py-2 text-[11px] font-bold tracking-wider uppercase border-b flex items-center justify-between ${
            darkTheme ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
          }`}>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Worldwide Location Matches
            </span>
            <span className="text-[10px] font-mono lowercase">Click or press Enter</span>
          </div>

          <div className="p-1 space-y-0.5">
            {/* Custom Input Option */}
            {value.trim().length > 0 && (
              <button
                type="button"
                onClick={handleSelectCustom}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition border ${
                  darkTheme
                    ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/60'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                }`}
              >
                <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="font-bold truncate">Search exact place: &quot;{value.trim()}&quot;</span>
              </button>
            )}

            {/* List of matched destinations */}
            {combinedResults.map((place, idx) => {
              const formattedName = place.country && place.country !== 'Global' ? `${place.name}, ${place.country}` : place.name;
              const isSelected = value.toLowerCase() === formattedName.toLowerCase() || value.toLowerCase() === place.name.toLowerCase();

              return (
                <button
                  key={`${place.name}-${idx}`}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                    isSelected
                      ? darkTheme
                        ? 'bg-indigo-900/60 text-white border border-indigo-500/40'
                        : 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold'
                      : darkTheme
                      ? 'hover:bg-slate-800 text-slate-200'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base flex-shrink-0">{place.flag}</span>
                    <div className="truncate">
                      <div className="font-bold flex items-center gap-1">
                        <span>{place.name}</span>
                        {place.country && place.country !== 'Global' && (
                          <span className={`text-[11px] font-normal ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                            ({place.country})
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                        {place.popularFor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      place.safetyRating === 'LOW'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : place.safetyRating === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        : 'bg-red-500/10 text-red-600 border-red-500/30'
                    }`}>
                      {place.region || 'Worldwide'}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
