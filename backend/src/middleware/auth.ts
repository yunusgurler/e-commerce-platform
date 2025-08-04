import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import * as jwt from "jsonwebtoken";
export interface AuthRequest extends Request {
  user?: any;
}


export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  const token = header.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (err: any) {
    console.warn("JWT verify failed:", err.message);

    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  next();
};