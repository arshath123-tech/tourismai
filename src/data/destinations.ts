export interface DestinationPlace {
  name: string;
  country: string;
  flag: string;
  region: string;
  safetyRating: 'LOW' | 'MEDIUM' | 'HIGH';
  popularFor: string;
}

export const POPULAR_DESTINATIONS: DestinationPlace[] = [
  // Gujarat & India
  { name: 'Gujarat State', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Heritage, Textile, Gir Lions & Statue of Unity' },
  { name: 'Ahmedabad', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Sabarmati Ashram, UNESCO Heritage City & Food' },
  { name: 'Statue of Unity (Kevadia)', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'World Tallest Statue, Narmada Valley & Ecotourism' },
  { name: 'Rann of Kutch', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'White Salt Desert, Rann Utsav & Handicrafts' },
  { name: 'Gir National Park', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Asiatic Lions Wildlife Safari & Eco-Resorts' },
  { name: 'Surat', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Diamond City, Silk Textiles & Street Food' },
  { name: 'Vadodara (Baroda)', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Laxmi Vilas Palace, Museums & Culture' },
  { name: 'Dwarka & Somnath', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Ancient Coastal Shrines & Pilgrimage' },
  { name: 'Gandhinagar', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Akshardham Temple, Capital City & Greenery' },
  { name: 'New Delhi', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'MEDIUM', popularFor: 'Capital, Heritage & Monuments' },
  { name: 'Taj Mahal (Agra)', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'World Wonder, Mughal Architecture' },
  { name: 'Jaipur (Pink City)', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Palaces, Forts & Culture' },
  { name: 'Goa', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Beaches, Nightlife & Water Sports' },
  { name: 'Kerala Backwaters', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Houseboats, Ayurveda & Nature' },
  { name: 'Mumbai', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Financial Hub, Gateway of India, Bollywood' },
  { name: 'Varanasi', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'MEDIUM', popularFor: 'Ghats, Spiritual Pilgrimage' },
  { name: 'Leh Ladakh', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'High Altitude Lakes & Monasteries' },
  { name: 'Udaipur', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'City of Lakes & Royal Palaces' },
  { name: 'Bengaluru', country: 'India', flag: '🇮🇳', region: 'Asia', safetyRating: 'LOW', popularFor: 'Tech Capital, Gardens & Craft Beer' },

  // Japan
  { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', region: 'Asia', safetyRating: 'LOW', popularFor: 'Metropolis, Technology, Culinary' },
  { name: 'Kyoto', country: 'Japan', flag: '🇯🇵', region: 'Asia', safetyRating: 'LOW', popularFor: 'Historic Shrines, Geisha Culture & Bamboo Groves' },
  { name: 'Osaka', country: 'Japan', flag: '🇯🇵', region: 'Asia', safetyRating: 'LOW', popularFor: 'Street Food, Castles & Nightlife' },
  { name: 'Hiroshima', country: 'Japan', flag: '🇯🇵', region: 'Asia', safetyRating: 'LOW', popularFor: 'Peace Memorial Park, Miyajima Island' },
  { name: 'Mount Fuji', country: 'Japan', flag: '🇯🇵', region: 'Asia', safetyRating: 'LOW', popularFor: 'Iconic Peak, Onsen Springs' },

  // Europe
  { name: 'Paris', country: 'France', flag: '🇫🇷', region: 'Europe', safetyRating: 'MEDIUM', popularFor: 'Eiffel Tower, Louvre, Fashion & Gastronomy' },
  { name: 'Rome', country: 'Italy', flag: '🇮🇹', region: 'Europe', safetyRating: 'LOW', popularFor: 'Colosseum, Vatican, Ancient History' },
  { name: 'Barcelona', country: 'Spain', flag: '🇪🇸', region: 'Europe', safetyRating: 'MEDIUM', popularFor: 'Sagrada Familia, Beaches, Tapas' },
  { name: 'London', country: 'United Kingdom', flag: '🇬🇧', region: 'Europe', safetyRating: 'LOW', popularFor: 'Big Ben, West End, Museums' },
  { name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', region: 'Europe', safetyRating: 'LOW', popularFor: 'Canals, Art Museums, Biking' },
  { name: 'Zurich', country: 'Switzerland', flag: '🇨🇭', region: 'Europe', safetyRating: 'LOW', popularFor: 'Alps, Banking, Lakes & Precision Watches' },

  // Middle East & Asia Pacific
  { name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', safetyRating: 'LOW', popularFor: 'Burj Khalifa, Desert Safaris, Luxury' },
  { name: 'Singapore', country: 'Singapore', flag: '🇸🇬', region: 'Asia', safetyRating: 'LOW', popularFor: 'Marina Bay Sands, Safety, Gardens by the Bay' },
  { name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', region: 'Asia', safetyRating: 'MEDIUM', popularFor: 'Temples, Night Markets, Floating Markets' },
  { name: 'Bali', country: 'Indonesia', flag: '🇮🇩', region: 'Asia', safetyRating: 'LOW', popularFor: 'Ubud Temples, Surfing, Resorts' },
  { name: 'Sydney', country: 'Australia', flag: '🇦🇺', region: 'Oceania', safetyRating: 'LOW', popularFor: 'Opera House, Bondi Beach, Harbour' },
  { name: 'Seoul', country: 'South Korea', flag: '🇰🇷', region: 'Asia', safetyRating: 'LOW', popularFor: 'K-Culture, Palaces, Shopping & Technology' },

  // Americas & Africa
  { name: 'New York City', country: 'United States', flag: '🇺🇸', region: 'Americas', safetyRating: 'MEDIUM', popularFor: 'Times Square, Broadway, Central Park' },
  { name: 'Vancouver', country: 'Canada', flag: '🇨🇦', region: 'Americas', safetyRating: 'LOW', popularFor: 'Mountains, Coastline, Nature' },
  { name: 'Cairo', country: 'Egypt', flag: '🇪🇬', region: 'Africa', safetyRating: 'MEDIUM', popularFor: 'Pyramids of Giza, Nile Cruises' }
];

export function searchDestinations(query: string): DestinationPlace[] {
  if (!query || query.trim().length === 0) return POPULAR_DESTINATIONS.slice(0, 8);
  const q = query.toLowerCase().trim();
  return POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.popularFor.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
  );
}
