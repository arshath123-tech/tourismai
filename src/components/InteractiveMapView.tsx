import React, { useState, useRef } from 'react';
import { MapPin, Sparkles, Compass, ExternalLink, Target, CheckCircle2, Navigation, PlusCircle, Edit3 } from 'lucide-react';

interface InteractiveMapViewProps {
  destination: string;
  className?: string;
  onPinLocationSelect?: (locationName: string) => void;
}

export function InteractiveMapView({
  destination,
  className = '',
  onPinLocationSelect
}: InteractiveMapViewProps) {
  const [mapType, setMapType] = useState<'m' | 'k' | 'p'>('m'); // m=street, k=satellite, p=terrain
  const [pinnedLocation, setPinnedLocation] = useState<string | null>(null);
  const [userCustomPin, setUserCustomPin] = useState<{ x: string; y: string; name: string } | null>(null);
  const [customPinNameInput, setCustomPinNameInput] = useState<string>('');
  const [isEditingPinName, setIsEditingPinName] = useState<boolean>(false);
  const mapOverlayRef = useRef<HTMLDivElement>(null);

  const destLower = (destination || 'gujarat').toLowerCase();

  // Preset regional points for reference
  let regionalPins = [
    { name: `${destination || 'Gujarat'} City Center`, tag: 'Urban Hub', top: '45%', left: '48%' },
    { name: `${destination || 'Gujarat'} Historic Quarter`, tag: 'Cultural Landmark', top: '32%', left: '38%' },
    { name: `${destination || 'Gujarat'} Scenic Valley`, tag: 'Nature Reserve', top: '60%', left: '62%' },
    { name: `${destination || 'Gujarat'} Heritage Monument`, tag: 'Tourism Hotspot', top: '25%', left: '58%' }
  ];

  if (destLower.includes('gujarat') || destLower.includes('ahmedabad') || destLower.includes('statue of unity')) {
    regionalPins = [
      { name: 'Sabarmati Ashram, Ahmedabad', tag: 'UNESCO & Freedom Heritage', top: '35%', left: '42%' },
      { name: 'Statue of Unity, Kevadia', tag: 'World\'s Tallest Statue', top: '62%', left: '68%' },
      { name: 'Gir National Park, Junagadh', tag: 'Asiatic Lion Safari', top: '70%', left: '32%' },
      { name: 'Rann of Kutch, Bhuj', tag: 'White Salt Desert & Rann Utsav', top: '22%', left: '25%' },
      { name: 'Somnath Temple, Veraval', tag: 'Ancient Coastal Shrine', top: '80%', left: '38%' }
    ];
  } else if (destLower.includes('delhi') || destLower.includes('agra') || destLower.includes('india')) {
    regionalPins = [
      { name: 'Taj Mahal, Agra', tag: 'World Wonder Landmark', top: '55%', left: '55%' },
      { name: 'India Gate, New Delhi', tag: 'National Monument', top: '30%', left: '40%' },
      { name: 'Red Fort, Old Delhi', tag: 'Mughal Architecture', top: '25%', left: '48%' },
      { name: 'Qutub Minar, Delhi', tag: 'Ancient Minaret', top: '65%', left: '38%' }
    ];
  }

  const encodedQuery = encodeURIComponent(destination || 'Gujarat, India');
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=${mapType}&z=11&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  const handlePinClick = (pinName: string) => {
    setPinnedLocation(pinName);
    if (onPinLocationSelect) {
      onPinLocationSelect(pinName);
    }
  };

  // User taps directly on map canvas to drop a custom pin
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapOverlayRef.current) return;
    const rect = mapOverlayRef.current.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const generatedName = `${destination || 'Gujarat'} Spot (Sector ${xPct}-${yPct})`;
    const newPin = {
      x: `${xPct}%`,
      y: `${yPct}%`,
      name: generatedName
    };

    setUserCustomPin(newPin);
    setCustomPinNameInput(generatedName);
    setPinnedLocation(generatedName);
    if (onPinLocationSelect) {
      onPinLocationSelect(generatedName);
    }
  };

  const handleConfirmCustomPinName = () => {
    if (!userCustomPin || !customPinNameInput.trim()) return;
    const updated = { ...userCustomPin, name: customPinNameInput.trim() };
    setUserCustomPin(updated);
    setPinnedLocation(updated.name);
    setIsEditingPinName(false);
    if (onPinLocationSelect) {
      onPinLocationSelect(updated.name);
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col text-white">
      {/* Map Header Bar Controls */}
      <div className="bg-slate-950 p-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-indigo-300">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-wide uppercase text-indigo-400 block">
              Interactive Travel Map
            </span>
            <span className="text-sm font-extrabold text-white flex items-center gap-2">
              Location: <strong className="text-amber-300">{destination || 'Gujarat, India'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Layer Mode Toggles */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setMapType('m')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mapType === 'm' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setMapType('k')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mapType === 'k' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('p')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                mapType === 'p' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Terrain
            </button>
          </div>

          <a
            href={externalMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg"
          >
            <span>Open Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* User Instruction Banner */}
      <div className="bg-indigo-950/60 border-b border-indigo-900/40 px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-2 text-indigo-200">
          <Navigation className="w-4 h-4 text-amber-400 animate-pulse" />
          <strong>Tap anywhere on the map below</strong> to drop your pin!
        </span>
        <span className="text-[11px] text-indigo-300 font-medium">
          Tourism AI provides instant details for your pinned location
        </span>
      </div>

      {/* Embedded Map Frame with Clickable Pin Overlay */}
      <div
        ref={mapOverlayRef}
        onClick={handleMapCanvasClick}
        className="relative w-full h-[380px] bg-slate-950 cursor-crosshair group select-none"
      >
        <iframe
          title={`Map of ${destination}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedUrl}
          className="w-full h-full border-0 opacity-80 pointer-events-none"
          loading="lazy"
        />

        {/* Preset Regional Pins */}
        <div className="absolute inset-0 pointer-events-none">
          {regionalPins.map((pin, index) => {
            const isPinned = pinnedLocation === pin.name;

            return (
              <div
                key={index}
                style={{ top: pin.top, left: pin.left }}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group/pin"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(pin.name);
                  }}
                  className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 shadow-2xl focus:outline-none ${
                    isPinned
                      ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300/80 scale-125 z-30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-110 z-20'
                  }`}
                >
                  <MapPin className={`w-5 h-5 ${isPinned ? 'animate-bounce' : ''}`} />
                </button>

                {/* Tooltip */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl text-center shadow-2xl border backdrop-blur-md transition-all duration-200 pointer-events-none z-40 ${
                  isPinned
                    ? 'bg-slate-900/95 border-amber-400 text-white opacity-100 scale-100'
                    : 'bg-slate-900/90 border-slate-700 text-slate-200 opacity-0 group-hover/pin:opacity-100 group-hover/pin:scale-100 scale-95'
                }`}>
                  <p className="text-[11px] font-bold text-amber-300 truncate">{pin.name}</p>
                  <p className="text-[9px] text-slate-300">{pin.tag}</p>
                </div>
              </div>
            );
          })}

          {/* USER CUSTOM PIN (Drop by user tap on map) */}
          {userCustomPin && (
            <div
              style={{ top: userCustomPin.y, left: userCustomPin.x }}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 z-50 group/userpin"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinClick(userCustomPin.name);
                }}
                className="relative flex items-center justify-center p-3 rounded-full bg-emerald-400 text-slate-950 ring-4 ring-emerald-300/80 scale-125 shadow-2xl focus:outline-none animate-bounce"
              >
                <MapPin className="w-6 h-6 text-slate-950" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </button>

              {/* User Pin Label Badge */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-48 p-2.5 rounded-2xl text-center shadow-2xl border border-emerald-400 bg-slate-950/95 text-white z-50 backdrop-blur-md">
                <span className="bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase block mb-1">
                  📍 USER PINNED LOCATION
                </span>
                <p className="text-xs font-extrabold text-amber-300">{userCustomPin.name}</p>
                <p className="text-[10px] text-emerald-300 font-semibold mt-0.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" /> Tourism AI Exploring Location
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Current Active Location Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 text-white text-xs font-bold px-4 py-2.5 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md flex items-center gap-2.5 z-10">
          <MapPin className="w-4.5 h-4.5 text-amber-400 animate-bounce" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Selected Location</span>
            <strong className="text-amber-300 text-xs">{destination || 'Gujarat, India'}</strong>
          </div>
        </div>
      </div>

      {/* User Pinned Location Bar & AI Trigger */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {userCustomPin ? (
          <div className="flex flex-wrap items-center justify-between w-full gap-2 bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                  Your Pinned Location
                </span>
                {isEditingPinName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={customPinNameInput}
                      onChange={(e) => setCustomPinNameInput(e.target.value)}
                      className="bg-slate-900 border border-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-xl focus:outline-none"
                      placeholder="Name your pinned location..."
                    />
                    <button
                      onClick={handleConfirmCustomPinName}
                      className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-xl hover:bg-emerald-400 transition"
                    >
                      Save Pin
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{userCustomPin.name}</strong>
                    <button
                      onClick={() => setIsEditingPinName(true)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Rename Pin"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handlePinClick(userCustomPin.name)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Pinned Location with Tourism AI</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-4 h-4 text-indigo-400" /> Tap map or select preset pin:
              </span>
              {regionalPins.map((pin) => (
                <button
                  key={pin.name}
                  type="button"
                  onClick={() => handlePinClick(pin.name)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition flex items-center gap-1.5 ${
                    pinnedLocation === pin.name
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md scale-105'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${pinnedLocation === pin.name ? 'text-slate-950' : 'text-indigo-400'}`} />
                  <span>{pin.name.split(',')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

