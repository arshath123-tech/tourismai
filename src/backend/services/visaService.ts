import { globalCache } from "./cacheService";

export interface VisaInfo {
  nationality: string;
  destination: string;
  visaRequired: boolean;
  visaType: string;
  allowedStayDays: number;
  eVisaAvailable: boolean;
  embassyContact: string;
  specialNotice: string;
}

export class VisaService {
  public static async getVisaInfo(nationality: string, destination: string): Promise<VisaInfo> {
    const cacheKey = `visa:${nationality.toLowerCase()}:${destination.toLowerCase()}`;
    const cached = globalCache.get<VisaInfo>(cacheKey);
    if (cached) return cached;

    const nat = nationality.toLowerCase();
    const dest = destination.toLowerCase();

    let info: VisaInfo;

    if (nat === dest || dest.includes(nat)) {
      info = {
        nationality,
        destination,
        visaRequired: false,
        visaType: "Domestic Travel / No Visa Required",
        allowedStayDays: 365,
        eVisaAvailable: true,
        embassyContact: "National Ministry of Home & External Affairs",
        specialNotice: "Valid government-issued national ID card or driver's license required for domestic transit."
      };
    } else if (dest.includes("japan")) {
      info = {
        nationality,
        destination,
        visaRequired: true,
        visaType: "Short-Term Tourist eVisa / Single Entry",
        allowedStayDays: 90,
        eVisaAvailable: true,
        embassyContact: "Embassy of Japan Consular Section (+81 3-3262-2391)",
        specialNotice: "Apply via JAPAN eVISA platform 14 days before arrival. Valid passport (min 6 months validity) required."
      };
    } else if (dest.includes("france") || dest.includes("paris") || dest.includes("italy") || dest.includes("spain") || dest.includes("europe")) {
      info = {
        nationality,
        destination,
        visaRequired: true,
        visaType: "Schengen Short-Stay Visa (Type C)",
        allowedStayDays: 90,
        eVisaAvailable: false,
        embassyContact: "Consulate General Schengen Division",
        specialNotice: "Biometric appointment required at official VFS Global / consulate application center. Mandates travel insurance minimum €30,000 coverage."
      };
    } else {
      info = {
        nationality,
        destination,
        visaRequired: true,
        visaType: "Tourist Visa / On Arrival or eVisa",
        allowedStayDays: 30,
        eVisaAvailable: true,
        embassyContact: `Consular Division for ${destination}`,
        specialNotice: "Verify passport validity (at least 6 months remaining) and return ticket confirmation."
      };
    }

    globalCache.set(cacheKey, info, 24 * 60 * 60 * 1000); // 24 hour cache
    return info;
  }
}
