import { Request, Response } from "express";
import { pool, logActivity } from "../../database/db";
import { UserStore } from "../../database/schema";
import { parseTokenUser } from "../middleware/auth";

export async function registerUser(req: Request, res: Response) {
  const { username, password, fullName, nationality, travelStyle, email } = req.body;

  if (!username || !password || !nationality) {
    return res.status(400).json({ error: "Username, password, and Nationality / Primary Country are mandatory." });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists. Please choose another." });
    }

    const newUser: UserStore = {
      id: `usr-traveller-${Date.now()}`,
      username,
      passwordHash: password,
      fullName: fullName || username,
      role: "ROLE_TRAVELLER",
      nationality,
      travelStyle: travelStyle || "Solo",
      createdAt: new Date().toISOString(),
      email: email || `${username}@tourism.ai`
    };

    await pool.query(
      'INSERT INTO users (id, username, "passwordHash", "fullName", role, nationality, "travelStyle", "createdAt", email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [newUser.id, newUser.username, newUser.passwordHash, newUser.fullName, newUser.role, newUser.nationality, newUser.travelStyle, newUser.createdAt, newUser.email]
    );

    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const agent = req.headers["user-agent"] || "Web Application";
    await logActivity(newUser.id, newUser.username, "REGISTER", `New traveller registered with nationality: ${nationality}`, ip, agent);

    const token = `jwt_token_${newUser.id}_${Date.now()}`;
    return res.json({
      message: "Registration successful!",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        nationality: newUser.nationality,
        travelStyle: newUser.travelStyle,
        createdAt: newUser.createdAt,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function loginUser(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND "passwordHash" = $2', [username, password]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password credentials." });
    }

    const user = result.rows[0] as UserStore;

    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const agent = req.headers["user-agent"] || "Web Application";
    await logActivity(user.id, user.username, "LOGIN", `Successful authentication as ${user.role}`, ip, agent);

    const token = `jwt_token_${user.id}_${Date.now()}`;
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        nationality: user.nationality,
        travelStyle: user.travelStyle,
        createdAt: user.createdAt,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(req: Request, res: Response) {
  const user = await parseTokenUser(req);
  if (!user) {
    return res.json({
      isAuthenticated: false,
      user: null,
      activeCountryContext: "India"
    });
  }

  return res.json({
    isAuthenticated: true,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      nationality: user.nationality,
      travelStyle: user.travelStyle,
      createdAt: user.createdAt,
      email: user.email
    },
    activeCountryContext: user.nationality || "India"
  });
}

export async function getProfile(req: Request, res: Response) {
  const user = await parseTokenUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  return res.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    nationality: user.nationality,
    travelStyle: user.travelStyle,
    createdAt: user.createdAt,
    email: user.email
  });
}

export async function updateProfile(req: Request, res: Response) {
  const user = await parseTokenUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { fullName, nationality, travelStyle, email } = req.body;
  
  if (fullName) user.fullName = fullName;
  if (nationality) user.nationality = nationality;
  if (travelStyle) user.travelStyle = travelStyle;
  if (email) user.email = email;

  try {
    await pool.query(
      'UPDATE users SET "fullName" = $1, nationality = $2, "travelStyle" = $3, email = $4 WHERE id = $5',
      [user.fullName, user.nationality, user.travelStyle, user.email, user.id]
    );

    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
    const agent = req.headers["user-agent"] || "Web Application";
    await logActivity(user.id, user.username, "PROFILE_UPDATE", `Updated profile (Nationality: ${user.nationality}, Style: ${user.travelStyle})`, ip, agent);

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        nationality: user.nationality,
        travelStyle: user.travelStyle,
        createdAt: user.createdAt,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
