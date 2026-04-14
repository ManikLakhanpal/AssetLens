import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth/authService.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      username: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing or malformed" });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
