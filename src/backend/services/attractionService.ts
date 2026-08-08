import { globalCache } from "./cacheService";

export interface AttractionItem {
  name: string;
  category: "Heritage" | "Nature" | "Culinary / Restaurant" | "Landmark" | "Shopping";
  recommendedVisitDuration: string;
  entryFee: string;
  highlight: string;
  safetyTip: string;
}

export class AttractionService {
  public static async getAttractions(destination: string): Promise<AttractionItem[]> {
    const cacheKey = `attractions:${destination.toLowerCase().trim()}`;
    const cached = globalCache.get<AttractionItem[]>(cacheKey);
    if (cached) return cached;

    const dest = destination.toLowerCase();

    let items: AttractionItem[] = [];

    if (dest.includes("tokyo")) {
      items = [
        { name: "Senso-ji Temple & Nakamise Street", category: "Heritage", recommendedVisitDuration: "2-3 Hours", entryFee: "Free", highlight: "Ancient Buddhist temple with vibrant street markets", safetyTip: "Keep to left on escalators; high pedestrian flow." },
        { name: "Shibuya Crossing & Sky Deck", category: "Landmark", recommendedVisitDuration: "1-2 Hours", entryFee: "$18 Sky Deck", highlight: "World famous scramble crossing and panoramic skyline", safetyTip: "Stay within designated pedestrian crosswalks." },
        { name: "Tsukiji Outer Market Food Tour", category: "Culinary / Restaurant", recommendedVisitDuration: "2 Hours", entryFee: "Pay as you order", highlight: "Fresh sushi, wagyu beef skewers & tamagoyaki", safetyTip: "Dispose trash at vendor bins." }
      ];
    } else if (dest.includes("kyoto")) {
      items = [
        { name: "Fushimi Inari Taisha", category: "Heritage", recommendedVisitDuration: "2-4 Hours", entryFee: "Free", highlight: "Thousands of iconic vermilion torii gates up Mount Inari", safetyTip: "Wear anti-slip walking shoes on mountain path." },
        { name: "Arashiyama Bamboo Grove & Monkey Park", category: "Nature", recommendedVisitDuration: "3 Hours", entryFee: "Free grove / $6 park", highlight: "Towering bamboo stalks & scenic Oi River views", safetyTip: "Stay on marked stone pathways." }
      ];
    } else if (dest.includes("gujarat") || dest.includes("ahmedabad") || dest.includes("statue of unity") || dest.includes("rann of kutch") || dest.includes("gir")) {
      items = [
        { name: "Statue of Unity & Sardar Sarovar Dam", category: "Landmark", recommendedVisitDuration: "Full Day", entryFee: "₹150 - ₹380", highlight: "182m tall tallest statue in the world with viewing gallery and laser show", safetyTip: "Book express viewing tickets online in advance." },
        { name: "Sabarmati Ashram & Riverfront Promenade", category: "Heritage", recommendedVisitDuration: "2 Hours", entryFee: "Free", highlight: "Mahatma Gandhi residence, museum & serene river walk", safetyTip: "Maintain quiet decorum in museum area." },
        { name: "Gir National Park Lion Safari", category: "Nature", recommendedVisitDuration: "Half Day", entryFee: "₹800 + Safari Jeep", highlight: "Only home of the Asiatic Lions in the wild", safetyTip: "Strictly remain inside safari jeep vehicle at all times." }
      ];
    } else {
      items = [
        { name: `${destination} Historic City Center & Square`, category: "Heritage", recommendedVisitDuration: "2-3 Hours", entryFee: "Free", highlight: "Architectural monuments, local museum & walking tours", safetyTip: "Keep wallet in front pocket in dense areas." },
        { name: `${destination} Central Culinary & Farmers Market`, category: "Culinary / Restaurant", recommendedVisitDuration: "1-2 Hours", entryFee: "Free entry", highlight: "Authentic local delicacies and fresh artisanal goods", safetyTip: "Use electronic pay or exact cash." }
      ];
    }

    globalCache.set(cacheKey, items, 60 * 60 * 1000);
    return items;
  }
}
