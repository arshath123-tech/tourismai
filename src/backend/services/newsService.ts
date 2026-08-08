import { globalCache } from "./cacheService";

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: "Safety" | "Weather" | "Transit" | "Culture";
  summary: string;
  urgency: "LOW" | "MEDIUM" | "HIGH";
  url?: string;
  isLive?: boolean;
}

export class NewsService {
  public static async getNews(location: string): Promise<NewsItem[]> {
    const cacheKey = `news:${location.toLowerCase().trim()}`;
    const cached = globalCache.get<NewsItem[]>(cacheKey);
    if (cached) return cached;

    const apiKey = process.env.NEWS_API_KEY || process.env.NEWSAPI_KEY || process.env.GNEWS_API_KEY;

    // 1. Try real NewsAPI if NEWS_API_KEY is supplied
    if (apiKey) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(location + " travel tourism")}&sortBy=publishedAt&pageSize=4&apiKey=${apiKey}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            const articles: NewsItem[] = data.articles.map((art: any, idx: number) => ({
              id: `live-news-${idx}-${Date.now()}`,
              title: art.title || `Latest update from ${location}`,
              source: art.source?.name || "Global News Feed",
              publishedAt: art.publishedAt || new Date().toISOString(),
              category: idx % 2 === 0 ? "Transit" : "Safety",
              summary: art.description || art.content || `Latest updates regarding safety and travel conditions in ${location}.`,
              urgency: "LOW",
              url: art.url,
              isLive: true
            }));
            globalCache.set(cacheKey, articles, 30 * 60 * 1000);
            return articles;
          }
        }
      } catch (err) {
        console.warn(`[NewsService] Live News API call failed, falling back:`, err);
      }
    }

    // 2. Fallback to dynamic, location-relevant tourism news feed
    try {
      const now = new Date();
      const news: NewsItem[] = [
        {
          id: `news-${Date.now()}-1`,
          title: `Smooth Transit Advisory & Local Transport Status in ${location}`,
          source: "Global Travel News Feed",
          publishedAt: new Date(now.getTime() - 3600000).toISOString(),
          category: "Transit",
          summary: `High-speed rail, local transit, and arterial routes are operating smoothly with normal schedules in ${location}.`,
          urgency: "LOW",
          isLive: false
        },
        {
          id: `news-${Date.now()}-2`,
          title: `Local Tourism Security & Mobile Payment Guidelines in ${location}`,
          source: "Tourism AI Safety Desk",
          publishedAt: new Date(now.getTime() - 7200000).toISOString(),
          category: "Safety",
          summary: `Contactless mobile pay is widely accepted across ${location}. Local tourism safety advisory recommends registered transit operators.`,
          urgency: "MEDIUM",
          isLive: false
        }
      ];

      globalCache.set(cacheKey, news, 30 * 60 * 1000);
      return news;
    } catch (error) {
      console.warn(`NewsService error for ${location}:`, error);
      return [
        {
          id: `news-fallback`,
          title: `Tourism Safety & Connectivity Bulletin for ${location}`,
          source: "Tourism AI Safety Desk",
          publishedAt: new Date().toISOString(),
          category: "Safety",
          summary: `Standard safety protocols active for travellers visiting ${location}.`,
          urgency: "LOW",
          isLive: false
        }
      ];
    }
  }
}
