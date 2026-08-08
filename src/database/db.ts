import { Pool } from 'pg';
import dotenv from 'dotenv';
import {
  UserStore,
  ActivityStore,
  SavedDestinationStore,
  ChatMessageStore,
  ServiceHealthState
} from './schema';

dotenv.config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "adminpassword123";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("[DB] No DATABASE_URL provided. Skipping initialization.");
    return;
  }
  
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        "passwordHash" VARCHAR(255) NOT NULL,
        "fullName" VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        nationality VARCHAR(255) NOT NULL,
        "travelStyle" VARCHAR(50) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL,
        email VARCHAR(255) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(255) PRIMARY KEY,
        "travellerId" VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        "activityType" VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        "ipAddress" VARCHAR(255) NOT NULL,
        "sessionMetadata" TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_destinations (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        "safetyRating" VARCHAR(50) NOT NULL,
        notes TEXT,
        "savedAt" TIMESTAMP NOT NULL,
        tags JSONB
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        "conversationId" VARCHAR(255) NOT NULL,
        "userId" VARCHAR(255) NOT NULL,
        sender VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
    `);

    // Insert default admin if not exists
    const adminCheck = await client.query('SELECT * FROM users WHERE username = $1', [ADMIN_USERNAME]);
    if (adminCheck.rows.length === 0) {
      await client.query(
        'INSERT INTO users (id, username, "passwordHash", "fullName", role, nationality, "travelStyle", "createdAt", email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          "usr-admin-001",
          ADMIN_USERNAME,
          ADMIN_PASSWORD,
          "System Administrator",
          "ROLE_ADMIN",
          "India",
          "Business",
          new Date(Date.now() - 30 * 86400000).toISOString(),
          "admin@tourism.ai"
        ]
      );
    }

    console.log("[DB] Tables initialized successfully.");
  } catch (err) {
    console.error("[DB] Error initializing database tables:", err);
  } finally {
    client.release();
  }
}

export async function logActivity(
  travellerId: string,
  username: string,
  activityType: string,
  details: string,
  ipAddress: string,
  sessionMetadata: string
) {
  if (!process.env.DATABASE_URL) return null;
  const newLog = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    travellerId,
    username,
    activityType,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: ipAddress.split(",")[0],
    sessionMetadata: sessionMetadata.substring(0, 100)
  };

  try {
    await pool.query(
      'INSERT INTO activities (id, "travellerId", username, "activityType", details, timestamp, "ipAddress", "sessionMetadata") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [newLog.id, newLog.travellerId, newLog.username, newLog.activityType, newLog.details, newLog.timestamp, newLog.ipAddress, newLog.sessionMetadata]
    );
    return newLog;
  } catch (err) {
    console.error("Error logging activity", err);
    return null;
  }
}
