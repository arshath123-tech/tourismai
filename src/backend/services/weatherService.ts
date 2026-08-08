import { globalCache } from "./cacheService";

export interface WeatherData {
  location: string;
  tempC: number;
  condition: string;
  humidity: number;
  windKmH: number;
  uvIndex: number;
  forecastAdvisory: string;
  icon: string;
  cachedAt?: string;
  isLive?: boolean;
}

export class WeatherService {
  private static tempDatabase: Record<string, { temp: number; condition: string }> = {
    tokyo: { temp: 22, condition: "Pleasant & Clear" },
    kyoto: { temp: 21, condition: "Mild Breeze" },
    osaka: { temp: 23, condition: "Sunny & Warm" },
    paris: { temp: 19, condition: "Light Overcast" },
    london: { temp: 17, condition: "Passing Showers" },
    newyork: { temp: 24, condition: "Clear Skies" },
    delhi: { temp: 34, condition: "Warm & Sunny" },
    mumbai: { temp: 31, condition: "Humid & Sunny" },
    ahmedabad: { temp: 36, condition: "Warm & Dry" },
    surat: { temp: 33, condition: "Humid Coastal Breeze" },
    sydney: { temp: 21, condition: "Ocean Breeze" },
    dubai: { temp: 39, condition: "Hot & Clear" },
    singapore: { temp: 30, condition: "Tropical Warmth" },
    rome: { temp: 26, condition: "Bright & Sunny" },
    barcelona: { temp: 25, condition: "Mediterranean Sun" },
    zurich: { temp: 18, condition: "Alpine Crisp Air" }
  };

  public static async getWeather(location: string): Promise<WeatherData> {
    const cacheKey = `weather:${location.toLowerCase().trim()}`;
    const cached = globalCache.get<WeatherData>(cacheKey);
    if (cached) {
      return { ...cached, cachedAt: cached.cachedAt || new Date().toISOString() };
    }

    const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;

    // 1. Try OpenWeatherMap API if API key is provided
    if (apiKey) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`
        );
        if (response.ok) {
          const data = await response.json();
          const weather: WeatherData = {
            location: data.name || location,
            tempC: Math.round(data.main?.temp ?? 22),
            condition: data.weather?.[0]?.main || "Clear",
            humidity: data.main?.humidity ?? 60,
            windKmH: Math.round((data.wind?.speed ?? 3.6) * 3.6),
            uvIndex: 6,
            forecastAdvisory: `Live weather report for ${location}: ${data.weather?.[0]?.description || "clear"}. High temp around ${Math.round(data.main?.temp_max ?? 25)}°C.`,
            icon: (data.weather?.[0]?.main || "").toLowerCase().includes("rain") ? "rain" : "sun",
            cachedAt: new Date().toISOString(),
            isLive: true
          };
          globalCache.set(cacheKey, weather, 15 * 60 * 1000);
          return weather;
        }
      } catch (err) {
        console.warn(`[WeatherService] OpenWeatherMap call failed, falling back:`, err);
      }
    }

    // 2. Try Open-Meteo Free Live API (No API key needed)
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude, name } = geoData.results[0];
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`
          );
          if (weatherRes.ok) {
            const wData = await weatherRes.json();
            const curr = wData.current_weather;
            if (curr) {
              const code = curr.weathercode;
              let cond = "Clear & Sunny";
              if (code > 0 && code <= 3) cond = "Partly Cloudy";
              else if (code >= 45 && code <= 48) cond = "Foggy";
              else if (code >= 51 && code <= 67) cond = "Rainy";
              else if (code >= 71) cond = "Snowy";

              const weather: WeatherData = {
                location: name || location,
                tempC: Math.round(curr.temperature),
                condition: cond,
                humidity: wData.hourly?.relativehumidity_2m?.[0] ?? 60,
                windKmH: Math.round(curr.windspeed),
                uvIndex: 5,
                forecastAdvisory: `Live Satellite Weather for ${name || location}: ${cond} at ${Math.round(curr.temperature)}°C with wind speed of ${Math.round(curr.windspeed)} km/h.`,
                icon: cond.includes("Rain") ? "rain" : "sun",
                cachedAt: new Date().toISOString(),
                isLive: true
              };
              globalCache.set(cacheKey, weather, 15 * 60 * 1000);
              return weather;
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[WeatherService] Open-Meteo live call failed, falling back:`, err);
    }

    // 3. Fallback to built-in destination profiles
    try {
      const locKey = Object.keys(this.tempDatabase).find(k => location.toLowerCase().includes(k)) || "default";
      const base = this.tempDatabase[locKey] || { temp: 24, condition: "Pleasant & Clear" };

      const weather: WeatherData = {
        location,
        tempC: base.temp,
        condition: base.condition,
        humidity: base.temp > 30 ? 50 : 65,
        windKmH: 12 + Math.floor(Math.random() * 8),
        uvIndex: base.temp > 30 ? 8 : 5,
        forecastAdvisory: `Optimal outdoor visibility for travel in ${location}. Keep light outerwear and UV protection handy.`,
        icon: base.temp > 30 ? "sun" : "sun-cloud",
        cachedAt: new Date().toISOString(),
        isLive: false
      };

      globalCache.set(cacheKey, weather, 20 * 60 * 1000);
      return weather;
    } catch (error) {
      console.warn(`WeatherService retrieval error for ${location}:`, error);
      return {
        location,
        tempC: 22,
        condition: "Mild & Clear",
        humidity: 60,
        windKmH: 12,
        uvIndex: 5,
        forecastAdvisory: `Weather data active for ${location}.`,
        icon: "sun-cloud",
        cachedAt: new Date().toISOString(),
        isLive: false
      };
    }
  }
}
