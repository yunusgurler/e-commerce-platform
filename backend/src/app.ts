import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import categoryRoutes from "./routes/category";
import adminCustomersRouter from "./routes/adminCustomer"
import adminRouter from "./routes/admin"
// ... import other routers

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/customers", adminCustomersRouter);
app.use("/api/admin", adminRouter);

// Health
app.get("/health", (req, res) => res.send("ok"));

export default app;
