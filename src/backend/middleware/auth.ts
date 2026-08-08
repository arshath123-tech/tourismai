import { Request, Response, NextFunction } from "express";
import { pool, GUEST_USER } from "../../database/db";
import { UserStore } from "../../database/schema";

export interface AuthenticatedRequest extends Request {
  user?: UserStore;
}

export async function parseTokenUser(req: Request): Promise<UserStore | undefined> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return undefined;

  const token = authHeader.substring(7);

  if (!process.env.DATABASE_URL) return undefined;

  try {
    const result = await pool.query("SELECT * FROM users");
    const users = result.rows as UserStore[];
    const foundUser = users.find(u => token.includes(u.id) || token.includes(u.username));
    return foundUser;
  } catch (err) {
    console.error("Parse Token Error:", err);
    return undefined;
  }
}

export async function getEffectiveUser(req: Request): Promise<UserStore> {
  const user = await parseTokenUser(req);
  return user || GUEST_USER;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  parseTokenUser(req).then(user => {
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    req.user = user;
    next();
  }).catch(err => {
    console.error("requireAuth error:", err);
    return res.status(500).json({ error: "Internal server error" });
  });
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  parseTokenUser(req).then(user => {
    if (!user) {
      return res.status(401).json({ error: "Authentication token missing." });
    }
    if (user.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "HTTP 403 Forbidden: Administrator access required." });
    }
    req.user = user;
    next();
  }).catch(err => {
    console.error("requireAdmin error:", err);
    return res.status(500).json({ error: "Internal server error" });
  });
}
