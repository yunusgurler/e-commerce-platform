import { Router } from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getPopularProducts,
} from "../controllers/product";
import {
  relatedByEmbedding,
  getFrequentlyBoughtTogether,
} from "../controllers/recommendation";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Public listing/search
router.get("/", listProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/popular", getPopularProducts);
router.get("/:id/related-by-embedding", relatedByEmbedding);

// Single product
router.get("/:id", getProduct);
router.get("/:id/frequently-bought-together", getFrequentlyBoughtTogether);
// Admin
router.post("/", requireAuth, requireAdmin, createProduct);
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

export default router;
