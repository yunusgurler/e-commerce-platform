import { Router } from "express";
import {
  registerController,
  loginController,
  verifyEmailController,
  refreshTokenController,
  meController
} from "../controllers/auth";

import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/verify-email", verifyEmailController);
router.post("/refresh", refreshTokenController);
router.get("/verify-email", verifyEmailController);
router.get("/me", requireAuth, meController);
router.post("/logout", (req, res) => {
  // Clear refresh token cookie
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });
  return res.json({ message: "Logged out" });
});

export default router;
