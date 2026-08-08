import { globalCache } from "./cacheService";
import { POPULAR_DESTINATIONS, DestinationPlace } from "../../data/destinations";

export interface DestinationProfile {
  name: string;
  country: string;
  region: string;
  safetyRating: "LOW" | "MEDIUM" | "HIGH";
  popularFor: string;
  flag: string;
  overview: string;
}

export class DestinationService {
  public static async getDestinationInfo(destinationQuery: string): Promise<DestinationProfile> {
    const cacheKey = `destination:${destinationQuery.toLowerCase().trim()}`;
    const cached = globalCache.get<DestinationProfile>(cacheKey);
    if (cached) return cached;

    const q = destinationQuery.toLowerCase().trim();
    const match = POPULAR_DESTINATIONS.find(
      (d) => q.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(q)
    );

    let profile: DestinationProfile;

    if (match) {
      profile = {
        name: match.name,
        country: match.country,
        region: match.region,
        safetyRating: match.safetyRating,
        popularFor: match.popularFor,
        flag: match.flag,
        overview: `${match.name} in ${match.country} (${match.region}) is world-famous for ${match.popularFor}. Global safety rating is ${match.safetyRating}.`
      };
    } else {
      profile = {
        name: destinationQuery,
        country: destinationQuery.includes(",") ? destinationQuery.split(",")[1].trim() : "Global",
        region: "International",
        safetyRating: "LOW",
        popularFor: "Culture, Sightseeing & Local Experiences",
        flag: "🌐",
        overview: `${destinationQuery} is an exciting travel destination offering unique cultural sights and local travel experiences.`
      };
    }

    globalCache.set(cacheKey, profile, 60 * 60 * 1000); // 1 hour cache
    return profile;
  }
}
