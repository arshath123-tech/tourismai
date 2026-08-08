export type UserRole = 'ROLE_ADMIN' | 'ROLE_TRAVELLER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  nationality: string;
  travelStyle: 'Solo' | 'Family' | 'Business' | 'Backpacker' | 'Luxury';
  createdAt: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  activeCountryContext: string;
}

export interface ActivityLog {
  id: string;
  travellerId: string;
  username: string;
  activityType: 
    | 'LOGIN' 
    | 'LOGOUT' 
    | 'RESEARCH' 
    | 'ASSESSMENT' 
    | 'CHAT_MESSAGE' 
    | 'SAVE_DESTINATION' 
    | 'REMOVE_DESTINATION' 
    | 'PROFILE_UPDATE' 
    | 'ADMIN_ACTION';
  details: string;
  timestamp: string;
  ipAddress?: string;
  sessionMetadata?: string;
}

export interface WeatherData {
  location: string;
  tempC: number;
  condition: string;
  humidity: number;
  windKmH: number;
  uvIndex: number;
  forecastAdvisory: string;
  icon: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: 'Safety' | 'Weather' | 'Transit' | 'Culture';
  summary: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  url?: string;
}

export interface TravelResearchResult {
  destination: string;
  travelStyle: string;
  primaryCountryContext: string;
  wordCount: number;
  content: {
    destinationContext: string;
    weatherGuidance: string;
    localNewsAlerts: string;
    safetyAssessment: {
      rating: 'LOW' | 'MEDIUM' | 'HIGH';
      summary: string;
      scams: string[];
      emergencyInfo: string;
      warnings: string[];
    };
    privacyRecommendations: string[];
    actionableChecklist: string[];
  };
  rawMarkdownText: string;
  weather: WeatherData;
  news: NewsItem[];
  timestamp: string;
}

export interface SafetyAssessmentResult {
  destination: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  wordCount: number;
  formattedOutput: string;
  regionalScams: string[];
  emergencyContacts: Record<string, string>;
  digitalPrivacyTips: string[];
  physicalSafetyTips: string[];
  checklist: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataSynthesis?: {
    weatherCondition?: string;
    newsHeadline?: string;
    safetyRating?: string;
  };
}

export interface SavedDestination {
  id: string;
  userId: string;
  destination: string;
  country: string;
  safetyRating: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
  savedAt: string;
  tags: string[];
}

export interface ServiceHealthItem {
  name: string;
  key: 'spring_ai' | 'weather_api' | 'news_api' | 'postgres_db';
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
  endpoint: string;
  details: string;
}

export interface SyntheticTestResult {
  testId: string;
  timestamp: string;
  totalDurationMs: number;
  overallStatus: 'PASSED' | 'FAILED' | 'PARTIAL';
  servicesTested: {
    name: string;
    status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    latencyMs: number;
    message: string;
  }[];
}

export interface AdminDashboardData {
  stats: {
    totalTravellers: number;
    totalActivitiesToday: number;
    activeSafetyAssessments: number;
    systemHealthScore: number;
  };
  services: ServiceHealthItem[];
  recentActivities: ActivityLog[];
  travellersList: User[];
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  region: string;
  dialCode: string;
  safetyIndex: number;
}
