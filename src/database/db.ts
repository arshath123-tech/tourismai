import {
  UserStore,
  ActivityStore,
  SavedDestinationStore,
  ChatMessageStore,
  ServiceHealthState
} from './schema';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminpassword123";

export const users: UserStore[] = [
  {
    id: "usr-admin-001",
    username: ADMIN_USERNAME,
    passwordHash: ADMIN_PASSWORD,
    fullName: "System Administrator",
    role: "ROLE_ADMIN",
    nationality: "India",
    travelStyle: "Business",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    email: "admin@tourism.ai",
  },
  {
    id: "usr-traveller-001",
    username: "traveller1",
    passwordHash: "password123",
    fullName: "Aarav Sharma",
    role: "ROLE_TRAVELLER",
    nationality: "India",
    travelStyle: "Solo",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    email: "aarav@example.com",
  },
  {
    id: "usr-traveller-002",
    username: "wanderer_japan",
    passwordHash: "password123",
    fullName: "Kenji Sato",
    role: "ROLE_TRAVELLER",
    nationality: "Japan",
    travelStyle: "Backpacker",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    email: "kenji@example.jp",
  }
];

export const activities: ActivityStore[] = [];

export const savedDestinations: SavedDestinationStore[] = [];

export const chatMessages: ChatMessageStore[] = [];

export const GUEST_USER: UserStore = {
  id: "guest-user",
  username: "Guest",
  passwordHash: "",
  fullName: "Guest Traveller",
  role: "ROLE_TRAVELLER",
  nationality: "India",
  travelStyle: "Solo",
  createdAt: new Date().toISOString(),
  email: "guest@tourism.ai"
};

export let serviceHealthState: ServiceHealthState = {
  spring_ai: { status: "HEALTHY", latencyMs: 142, uptimePercent: 99.9, lastChecked: new Date().toISOString() },
  weather_api: { status: "HEALTHY", latencyMs: 88, uptimePercent: 99.7, lastChecked: new Date().toISOString() },
  news_api: { status: "HEALTHY", latencyMs: 110, uptimePercent: 99.5, lastChecked: new Date().toISOString() },
  postgres_db: { status: "HEALTHY", latencyMs: 12, uptimePercent: 100.0, lastChecked: new Date().toISOString() },
};

export function updateServiceHealthState(newState: ServiceHealthState) {
  serviceHealthState = newState;
}

export function logActivity(
  travellerId: string,
  username: string,
  activityType: string,
  details: string,
  ipAddress: string,
  sessionMetadata: string
) {
  const newLog: ActivityStore = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    travellerId,
    username,
    activityType,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: ipAddress.split(",")[0],
    sessionMetadata: sessionMetadata.substring(0, 100)
  };

  activities.unshift(newLog);
  if (activities.length > 500) activities.pop();
  return newLog;
}
