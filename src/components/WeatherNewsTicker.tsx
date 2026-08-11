import React, { useEffect, useState } from 'react';
import { Sun, AlertCircle, Newspaper, Thermometer, Wind, RefreshCw, WifiOff } from 'lucide-react';
import { fetchWeatherApi, fetchNewsApi } from '../services/api';
import { WeatherData, NewsItem } from '../types';

interface WeatherNewsTickerProps {
  location: string;
}

export function WeatherNewsTicker({ location }: WeatherNewsTickerProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [w, n] = await Promise.all([
          fetchWeatherApi(location),
          fetchNewsApi(location)
        ]);
        if (isMounted) {
          setWeather(w);
          setNews(n);
        }
      } catch (err) {
        console.error('Failed to load weather/news:', err);
        if (isMounted) {
          setError('Something went wrong. Please check your connection and try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [location]);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Live Travel Weather & News: <span className="text-white">{location}</span>
          </span>
        </div>
        {loading && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-700/50 flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-300">Something went wrong</p>
            <p className="text-xs text-slate-400 mt-0.5">Kindly check your internet connection and try again.</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setWeather(null);
              setNews([]);
              // re-trigger useEffect by calling loadData indirectly via state toggle
              setLoading(true);
              Promise.all([fetchWeatherApi(location), fetchNewsApi(location)])
                .then(([w, n]) => { setWeather(w); setNews(n); })
                .catch(() => setError('Something went wrong. Please check your connection and try again.'))
                .finally(() => setLoading(false));
            }}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weather Card */}
          <div className="bg-slate-850 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" />
                Local Weather Forecast
              </span>
              <span className="text-[10px] bg-slate-700 text-amber-300 px-2 py-0.5 rounded font-mono">
                Live Feed
              </span>
            </div>
            {weather ? (
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-2xl font-black text-white">{weather.tempC}°C</span>
                  <span className="text-xs font-medium text-emerald-300">{weather.condition}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-indigo-400" />
                    Humidity: {weather.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-indigo-400" />
                    Wind: {weather.windKmH} km/h
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  🌦️ {weather.forecastAdvisory}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-2">Loading weather updates...</div>
            )}
          </div>

          {/* News & Disruptions Card */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-indigo-400" />
                Local Travel News
              </span>
              <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded font-mono">
                Latest Alerts
              </span>
            </div>

            <div className="space-y-2">
              {news.map((item) => (
                <div key={item.id} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200 line-clamp-1">{item.title}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      item.urgency === 'HIGH' ? 'bg-red-900/60 text-red-300' : 'bg-emerald-900/60 text-emerald-300'
                    }`}>
                      {item.urgency}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
