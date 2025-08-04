// src/routes/adminCustomers.ts
import { Router } from "express";
import User from "../models/User";
import Order from "../models/Order";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/customers?search=&page=&limit=
router.get("/", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const {
    search = "",
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;
  const filter: any = { role: "customer" };
  if (search) {
    filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const customers = await User.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .select("-passwordHash");
  const total = await User.countDocuments(filter);
  res.json({
    customers,
    meta: { total, page: Number(page), limit: Number(limit) },
  });
});

// GET /api/admin/customers/:id  (include order history)
router.get("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "Not found" });
  const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
  res.json({ user, orders });
});

export default router;
