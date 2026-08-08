import { WeatherService, WeatherData } from "./weatherService";
import { NewsService, NewsItem } from "./newsService";
import { DestinationService, DestinationProfile } from "./destinationService";
import { HotelService, HotelRecommendation } from "./hotelService";
import { AttractionService, AttractionItem } from "./attractionService";
import { VisaService, VisaInfo } from "./visaService";

export interface IntentAnalysis {
  needsWeather: boolean;
  needsNews: boolean;
  needsSafety: boolean;
  needsHotels: boolean;
  needsAttractions: boolean;
  needsRestaurants: boolean;
  needsVisa: boolean;
  needsItinerary: boolean;
  primaryDestination: string;
  queryType: string;
}

export interface RetrievedContext {
  destination: DestinationProfile;
  weather?: WeatherData | null;
  news?: NewsItem[] | null;
  hotels?: HotelRecommendation[] | null;
  attractions?: AttractionItem[] | null;
  visaInfo?: VisaInfo | null;
  retrievalMetadata: {
    sourcesQueried: string[];
    successfulSources: string[];
    failedSources: string[];
    durationMs: number;
  };
}

export class RequestRouterService {
  public static analyzeIntent(message: string, defaultDestination = "Tokyo, Japan"): IntentAnalysis {
    const text = message.toLowerCase();

    // Destination extraction attempt
    let extractedDest = defaultDestination;
    const destKeywords = [
      "tokyo", "kyoto", "osaka", "gujarat", "ahmedabad", "statue of unity", "kutch", "gir", "paris",
      "london", "new york", "delhi", "mumbai", "sydney", "dubai", "singapore", "rome", "barcelona",
      "bali", "zurich", "goa", "kerala", "jaipur"
    ];
    for (const kw of destKeywords) {
      if (text.includes(kw)) {
        extractedDest = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }

    const needsWeather = text.includes("weather") || text.includes("temp") || text.includes("rain") || text.includes("climate") || text.includes("forecast") || text.includes("hot") || text.includes("cold") || text.includes("attire");
    const needsSafety = text.includes("safe") || text.includes("scam") || text.includes("crime") || text.includes("emergency") || text.includes("police") || text.includes("risk") || text.includes("security") || text.includes("night");
    const needsNews = needsSafety || text.includes("news") || text.includes("disruption") || text.includes("transit") || text.includes("strike") || text.includes("alert");
    const needsHotels = text.includes("hotel") || text.includes("stay") || text.includes("resort") || text.includes("hostel") || text.includes("accommodation") || text.includes("booking") || text.includes("room");
    const needsAttractions = text.includes("see") || text.includes("visit") || text.includes("place") || text.includes("attraction") || text.includes("spot") || text.includes("temple") || text.includes("sight") || text.includes("tour");
    const needsRestaurants = text.includes("food") || text.includes("eat") || text.includes("restaurant") || text.includes("cuisine") || text.includes("dish") || text.includes("dining") || text.includes("cafe");
    const needsVisa = text.includes("visa") || text.includes("passport") || text.includes("entry") || text.includes("embassy") || text.includes("consulate") || text.includes("border");
    const needsItinerary = text.includes("itinerary") || text.includes("plan") || text.includes("days") || text.includes("schedule") || text.includes("trip");

    let queryType = "GENERAL_TRAVEL_ASSISTANCE";
    if (needsWeather) queryType = "WEATHER_ENVIRONMENTAL";
    else if (needsSafety || needsNews) queryType = "SAFETY_AND_SECURITY";
    else if (needsHotels) queryType = "ACCOMMODATION_HOTELS";
    else if (needsAttractions || needsRestaurants) queryType = "ATTRACTIONS_CULTURE";
    else if (needsVisa) queryType = "VISA_DOCUMENTATION";
    else if (needsItinerary) queryType = "TRIP_ITINERARY_PLANNING";

    return {
      needsWeather: needsWeather || queryType === "GENERAL_TRAVEL_ASSISTANCE" || needsItinerary,
      needsNews: needsNews || needsSafety || queryType === "GENERAL_TRAVEL_ASSISTANCE",
      needsSafety: needsSafety || queryType === "GENERAL_TRAVEL_ASSISTANCE",
      needsHotels,
      needsAttractions: needsAttractions || queryType === "GENERAL_TRAVEL_ASSISTANCE" || needsItinerary,
      needsRestaurants,
      needsVisa,
      needsItinerary,
      primaryDestination: extractedDest,
      queryType
    };
  }

  public static async retrieveDataForIntent(
    intent: IntentAnalysis,
    userNationality = "India",
    userTravelStyle = "Solo"
  ): Promise<RetrievedContext> {
    const startTime = Date.now();
    const destName = intent.primaryDestination;

    const sourcesQueried: string[] = ["DestinationService"];
    const successfulSources: string[] = [];
    const failedSources: string[] = [];

    const tasks: Promise<any>[] = [];
    const taskNames: string[] = [];

    // Always retrieve Destination Profile
    tasks.push(DestinationService.getDestinationInfo(destName));
    taskNames.push("DestinationService");

    // Retrieve Weather if needed
    if (intent.needsWeather) {
      sourcesQueried.push("WeatherService");
      tasks.push(WeatherService.getWeather(destName));
      taskNames.push("WeatherService");
    }

    // Retrieve News/Advisories if needed
    if (intent.needsNews || intent.needsSafety) {
      sourcesQueried.push("NewsService");
      tasks.push(NewsService.getNews(destName));
      taskNames.push("NewsService");
    }

    // Retrieve Hotels if needed
    if (intent.needsHotels) {
      sourcesQueried.push("HotelService");
      tasks.push(HotelService.getHotels(destName, userTravelStyle));
      taskNames.push("HotelService");
    }

    // Retrieve Attractions/Restaurants if needed
    if (intent.needsAttractions || intent.needsRestaurants || intent.needsItinerary) {
      sourcesQueried.push("AttractionService");
      tasks.push(AttractionService.getAttractions(destName));
      taskNames.push("AttractionService");
    }

    // Retrieve Visa info if needed
    if (intent.needsVisa) {
      sourcesQueried.push("VisaService");
      tasks.push(VisaService.getVisaInfo(userNationality, destName));
      taskNames.push("VisaService");
    }

    const results = await Promise.allSettled(tasks);

    let destinationInfo: DestinationProfile = {
      name: destName,
      country: destName,
      region: "Global",
      safetyRating: "LOW",
      popularFor: "Travel & Culture",
      flag: "✈️",
      overview: `Information active for ${destName}.`
    };

    let weatherData: WeatherData | null = null;
    let newsData: NewsItem[] | null = null;
    let hotelsData: HotelRecommendation[] | null = null;
    let attractionsData: AttractionItem[] | null = null;
    let visaData: VisaInfo | null = null;

    results.forEach((res, idx) => {
      const serviceName = taskNames[idx];
      if (res.status === "fulfilled") {
        successfulSources.push(serviceName);
        const val = res.value;
        if (serviceName === "DestinationService") destinationInfo = val;
        else if (serviceName === "WeatherService") weatherData = val;
        else if (serviceName === "NewsService") newsData = val;
        else if (serviceName === "HotelService") hotelsData = val;
        else if (serviceName === "AttractionService") attractionsData = val;
        else if (serviceName === "VisaService") visaData = val;
      } else {
        failedSources.push(serviceName);
        console.warn(`Parallel RAG retrieval failed for ${serviceName}:`, res.reason);
      }
    });

    const durationMs = Date.now() - startTime;

    return {
      destination: destinationInfo,
      weather: weatherData,
      news: newsData,
      hotels: hotelsData,
      attractions: attractionsData,
      visaInfo: visaData,
      retrievalMetadata: {
        sourcesQueried,
        successfulSources,
        failedSources,
        durationMs
      }
    };
  }
}
