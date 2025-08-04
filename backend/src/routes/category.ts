import { Router } from "express";
import Category from "../models/Category";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: list all active categories
router.get("/", async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({
    sortOrder: 1,
  });
  res.json({ categories });
});

// (Optional) single category by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id))
    return res.status(400).json({ message: "Invalid ID" });
  const cat = await Category.findById(id);
  if (!cat) return res.status(404).json({ message: "Not found" });
  res.json(cat);
});

// Admin: create/update/delete
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, description, image, isActive, sortOrder } = req.body;
  const cat = await Category.create({
    name,
    description,
    image,
    isActive,
    sortOrder,
  });
  res.status(201).json(cat);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

export default router;
