import {
  User,
  TravelResearchResult,
  SafetyAssessmentResult,
  ChatMessage,
  SavedDestination,
  AdminDashboardData,
  ActivityLog,
  ServiceHealthItem,
  SyntheticTestResult,
  WeatherData,
  NewsItem
} from '../types';

let currentToken: string | null = localStorage.getItem('smart_tourism_token');

export function setAuthToken(token: string | null) {
  currentToken = token;
  if (token) {
    localStorage.setItem('smart_tourism_token', token);
  } else {
    localStorage.removeItem('smart_tourism_token');
  }
}

export function getAuthToken(): string | null {
  return currentToken;
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
}

// 1. AUTHENTICATION
export async function loginApi(username: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setAuthToken(data.token);
  return data;
}

export async function registerApi(payload: {
  username: string;
  password: string;
  fullName: string;
  nationality: string; // Mandatory selector value
  travelStyle?: string;
  email?: string;
}) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  setAuthToken(data.token);
  return data;
}

export async function fetchMeApi() {
  const res = await fetch('/api/auth/me', {
    headers: getAuthHeaders(),
  });
  return await res.json();
}

// 2. TRAVEL RESEARCH & SAFETY ASSESSMENT
export async function fetchTravelResearch(params: {
  destination: string;
  travelStyle?: string;
  countryContext?: string;
}): Promise<TravelResearchResult> {
  const res = await fetch('/api/travel/research', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Research request failed');
  return data;
}

export async function fetchSafetyAssessment(params: {
  destination: string;
  itineraryDetails?: string;
}): Promise<SafetyAssessmentResult> {
  const res = await fetch('/api/travel/assessment', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Safety assessment request failed');
  return data;
}

// 3. CHAT ASSISTANT
export async function sendChatMessageApi(params: {
  conversationId?: string;
  message: string;
  destinationContext?: string;
}) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Chat message failed');
  return data;
}

export async function fetchChatHistoryApi(conversationId?: string) {
  const endpoint = conversationId ? `/api/chat/${conversationId}` : '/api/chat/history';
  const res = await fetch(endpoint, {
    headers: getAuthHeaders(),
  });
  return await res.json();
}

// 4. SAVED DESTINATIONS
export async function fetchSavedDestinationsApi(): Promise<SavedDestination[]> {
  const res = await fetch('/api/saved-destinations', {
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function addSavedDestinationApi(payload: {
  destination: string;
  country: string;
  safetyRating?: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
  tags?: string[];
}): Promise<SavedDestination> {
  const res = await fetch('/api/saved-destinations', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save destination');
  return data;
}

export async function deleteSavedDestinationApi(id: string) {
  const res = await fetch(`/api/saved-destinations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return await res.json();
}

// 5. PROFILE MANAGEMENT
export async function fetchProfileApi() {
  const res = await fetch('/api/traveller/profile', {
    headers: getAuthHeaders(),
  });
  return await res.json();
}

export async function updateProfileApi(payload: {
  fullName?: string;
  nationality?: string;
  travelStyle?: 'Solo' | 'Family' | 'Business' | 'Backpacker' | 'Luxury';
  email?: string;
}) {
  const res = await fetch('/api/traveller/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return await res.json();
}

// 6. WEATHER & NEWS
export async function fetchWeatherApi(location: string): Promise<WeatherData> {
  const res = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
  return await res.json();
}

export async function fetchNewsApi(location: string): Promise<NewsItem[]> {
  const res = await fetch(`/api/news?location=${encodeURIComponent(location)}`);
  return await res.json();
}

// 7. ADMIN CONTROL PLANE (`ROLE_ADMIN` restricted)
export async function fetchAdminDashboardApi(): Promise<AdminDashboardData> {
  const res = await fetch('/api/admin/dashboard', {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Admin dashboard request failed');
  return data;
}

export async function fetchAdminTravellersApi(): Promise<User[]> {
  const res = await fetch('/api/admin/travellers', {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch travellers');
  return data;
}

export async function adminCreateTravellerApi(payload: {
  username: string;
  password: string;
  fullName: string;
  nationality: string;
  travelStyle?: string;
  email?: string;
}) {
  const res = await fetch('/api/admin/travellers', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create traveller account');
  return data;
}

export async function adminDeleteTravellerApi(id: string) {
  const res = await fetch(`/api/admin/travellers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove traveller');
  return data;
}

export async function fetchActivitiesApi(filters?: {
  travellerId?: string;
  activityType?: string;
  search?: string;
}): Promise<ActivityLog[]> {
  const params = new URLSearchParams();
  if (filters?.travellerId) params.append('travellerId', filters.travellerId);
  if (filters?.activityType) params.append('activityType', filters.activityType);
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`/api/admin/activities?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch activities');
  return data;
}

export async function fetchApiMonitorApi() {
  const res = await fetch('/api/admin/api-monitor', {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch API monitor');
  return data;
}

export async function runSyntheticHealthTestApi(): Promise<SyntheticTestResult> {
  const res = await fetch('/api/admin/api-monitor/test', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Synthetic health test failed');
  return data;
}

export async function updateUserRoleApi(userId: string, newRole: 'ROLE_ADMIN' | 'ROLE_TRAVELLER') {
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newRole }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Role update failed');
  return data;
}
