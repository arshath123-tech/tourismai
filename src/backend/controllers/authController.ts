import { Request, Response } from "express";
import { users, logActivity } from "../../database/db";
import { UserStore } from "../../database/schema";
import { parseTokenUser } from "../middleware/auth";

export function registerUser(req: Request, res: Response) {
  const { username, password, fullName, nationality, travelStyle, email } = req.body;

  if (!username || !password || !nationality) {
    return res.status(400).json({ error: "Username, password, and Nationality / Primary Country are mandatory." });
  }

  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
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

  users.push(newUser);

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Web Application";
  logActivity(newUser.id, newUser.username, "REGISTER", `New traveller registered with nationality: ${nationality}`, ip, agent);

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
}

export function loginUser(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password credentials." });
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Web Application";
  logActivity(user.id, user.username, "LOGIN", `Successful authentication as ${user.role}`, ip, agent);

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
}

export function getMe(req: Request, res: Response) {
  const user = parseTokenUser(req);
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

export function getProfile(req: Request, res: Response) {
  const user = parseTokenUser(req);
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

export function updateProfile(req: Request, res: Response) {
  const user = parseTokenUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { fullName, nationality, travelStyle, email } = req.body;
  if (fullName) user.fullName = fullName;
  if (nationality) user.nationality = nationality;
  if (travelStyle) user.travelStyle = travelStyle;
  if (email) user.email = email;

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";
  const agent = req.headers["user-agent"] || "Web Application";
  logActivity(user.id, user.username, "PROFILE_UPDATE", `Updated profile (Nationality: ${user.nationality}, Style: ${user.travelStyle})`, ip, agent);

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
}
