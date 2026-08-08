import { Request, Response, NextFunction } from "express";
import { users, GUEST_USER } from "../../database/db";
import { UserStore } from "../../database/schema";

export interface AuthenticatedRequest extends Request {
  user?: UserStore;
}

export function parseTokenUser(req: Request): UserStore | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return undefined;
  const token = authHeader.substring(7);
  const foundUser = users.find(u => token.includes(u.id) || token.includes(u.username));
  return foundUser;
}

export function getEffectiveUser(req: Request): UserStore {
  return parseTokenUser(req) || GUEST_USER;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = parseTokenUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized access. Please log in." });
  }
  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = parseTokenUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication token missing." });
  }
  if (user.role !== "ROLE_ADMIN") {
    return res.status(403).json({ error: "HTTP 403 Forbidden: Administrator access required." });
  }
  req.user = user;
  next();
}
