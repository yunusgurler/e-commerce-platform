// controllers/auth.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { sendEmail } from "../services/emailService";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const registerController = async (req: Request, res: Response) => {
  try {
    let { firstName, lastName, email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: "Invalid input" });
    }

    email = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already used" });

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      emailVerificationToken,
      isEmailVerified: false,
    });

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${emailVerificationToken}&email=${encodeURIComponent(
      email
    )}`;

    try {
      await sendEmail(
        email,
        "Verify your email",
        `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
      );
    } catch (err) {
      console.warn("Email failed (non-blocking):", err);
      // continue
    }

    const responsePayload: any = { message: "Registered. Verify via email." };
    // expose the link in dev/testing if configured
    if (
      process.env.USE_ETHEREAL === "true" ||
      process.env.NODE_ENV !== "production"
    ) {
      responsePayload.verificationLink = verifyUrl;
    }

    return res.status(201).json(responsePayload);
  } catch (err: any) {
    console.error("registerController error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    email = String(email).toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isEmailVerified)
      return res.status(403).json({ message: "Email not verified" });

    const accessToken = signAccessToken({
      userId: user._id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const refreshToken = signRefreshToken({
      userId: user._id,
      role: user.role,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        parseInt(process.env.REFRESH_TOKEN_EXPIRY_SECONDS || "604800", 10) *
          1000 || // fallback 7d
        7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("loginController error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    const email = (req.query.email as string)?.toLowerCase().trim();
    if (!token || !email) return res.status(400).send("Missing token or email");

    const user = await User.findOne({
      email,
      emailVerificationToken: token,
    });

    if (!user)
      return res.status(400).send("Invalid or expired verification link.");

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined as any;
    await user.save();

    return res.redirect(`${FRONTEND_URL}/login?verified=1`);
  } catch (err: any) {
    console.error("verifyEmailController error:", err);
    return res.status(500).send("Server error");
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No token" });

    const payload: any = verifyRefreshToken(token);
    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
      // optionally include more if desired
    });
    return res.json({ accessToken });
  } catch (err) {
    console.warn("refreshTokenController invalid:", err);
    return res.status(401).json({ message: "Invalid refresh" });
  }
};

export const meController = async (req: any, res: Response) => {
  try {
    if (!req.user?.userId)
      return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(req.user.userId).select(
      "-passwordHash -emailVerificationToken"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err: any) {
    console.error("meController error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
