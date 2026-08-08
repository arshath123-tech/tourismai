export interface UserStore {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'ROLE_ADMIN' | 'ROLE_TRAVELLER';
  nationality: string;
  travelStyle: 'Solo' | 'Family' | 'Business' | 'Backpacker' | 'Luxury';
  createdAt: string;
  email: string;
}

export interface ActivityStore {
  id: string;
  travellerId: string;
  username: string;
  activityType: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  sessionMetadata: string;
}

export interface SavedDestinationStore {
  id: string;
  userId: string;
  destination: string;
  country: string;
  safetyRating: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
  savedAt: string;
  tags: string[];
}

export interface ChatMessageStore {
  id: string;
  conversationId: string;
  userId: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ServiceHealthState {
  spring_ai: { status: string; latencyMs: number; uptimePercent: number; lastChecked: string };
  weather_api: { status: string; latencyMs: number; uptimePercent: number; lastChecked: string };
  news_api: { status: string; latencyMs: number; uptimePercent: number; lastChecked: string };
  postgres_db: { status: string; latencyMs: number; uptimePercent: number; lastChecked: string };
}
