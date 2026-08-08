import { globalCache } from "./cacheService";

export interface HotelRecommendation {
  name: string;
  category: "Luxury" | "Boutique" | "Budget" | "Eco-Lodge" | "Family-Friendly";
  rating: number;
  estimatedPricePerNight: string;
  locationNeighborhood: string;
  keyAmenities: string[];
  safetyCertification: boolean;
}

export class HotelService {
  public static async getHotels(destination: string, travelStyle = "Solo"): Promise<HotelRecommendation[]> {
    const cacheKey = `hotels:${destination.toLowerCase().trim()}:${travelStyle.toLowerCase()}`;
    const cached = globalCache.get<HotelRecommendation[]>(cacheKey);
    if (cached) return cached;

    const isLuxury = travelStyle.toLowerCase().includes("luxury") || travelStyle.toLowerCase().includes("business");
    const isBudget = travelStyle.toLowerCase().includes("backpacker") || travelStyle.toLowerCase().includes("budget");

    const hotels: HotelRecommendation[] = [
      {
        name: isLuxury ? `${destination} Grand Heritage Resort & Spa` : `${destination} Central Suites`,
        category: isLuxury ? "Luxury" : "Boutique",
        rating: 4.8,
        estimatedPricePerNight: isLuxury ? "$280 - $450" : "$110 - $180",
        locationNeighborhood: "City Center / Historic Quarter",
        keyAmenities: ["24/7 Concierge", "High-Speed Wi-Fi", "Airport Transfer", "Spa & Wellness"],
        safetyCertification: true
      },
      {
        name: isBudget ? `${destination} Backpacker Pod Hostel` : `${destination} Urban Express Stay`,
        category: isBudget ? "Budget" : "Family-Friendly",
        rating: 4.5,
        estimatedPricePerNight: isBudget ? "$35 - $65" : "$75 - $120",
        locationNeighborhood: "Near Central Transit Station",
        keyAmenities: ["Lockers & Security", "Free Breakfast", "Co-Working Lounge", "Local Metro Pass"],
        safetyCertification: true
      }
    ];

    globalCache.set(cacheKey, hotels, 60 * 60 * 1000);
    return hotels;
  }
}
