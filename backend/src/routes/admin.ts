// src/routes/admin.ts
import { Router } from "express";
import { getDashboardStats } from "../controllers/admin";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/dashboard", requireAuth, requireAdmin, getDashboardStats);

export default router;
