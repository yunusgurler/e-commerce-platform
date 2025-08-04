// controllers/recommendation.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import Interaction from "../models/Interaction";
import { cosineSimilarity, ensureProductEmbedding } from "../services/embeddings";

/**
 * GET /api/products/:id/frequently-bought-together
 */
export const getFrequentlyBoughtTogether = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    // find orders containing this product
    const orders = await Order.find({ "items.product": id }).lean();

    const counter: Record<string, number> = {};

    orders.forEach((order: any) => {
      (order.items || []).forEach((it: any) => {
        const pid = String(it.product);
        if (pid === id) return;
        counter[pid] = (counter[pid] || 0) + 1;
      });
    });

    const sortedIds = Object.entries(counter)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([productId]) => productId);

    let products: any[] = [];
    if (sortedIds.length) {
      products = await Product.find({ _id: { $in: sortedIds } }).lean();
    }

    res.json({ frequentlyBoughtTogether: products });
  } catch (err) {
    console.error("getFrequentlyBoughtTogether error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/products/:productId/related
 * Uses other users' views to suggest related products, with fallback to popular.
 */

export const relatedByEmbedding = async (req: Request, res: Response) => {
  const { id } = req.params; // product id

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    // ensure base product embedding exists
    await ensureProductEmbedding(id);
    const base = await Product.findById(id).lean();
    if (!base) return res.status(404).json({ message: "Product not found" });
    if (
      !base.embedding ||
      !Array.isArray(base.embedding) ||
      base.embedding.length === 0
    ) {
      return res
        .status(500)
        .json({ message: "Embedding missing for base product" });
    }

    // fetch other products that have embeddings
    const others = await Product.find({
      _id: { $ne: base._id },
      embedding: { $exists: true, $ne: [] },
    }).lean();

    // compute similarity scores
    const scored = others
      .map((p) => {
        const score = cosineSimilarity(
          base.embedding as number[],
          p.embedding as number[]
        );
        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // top 6

    // return the products with their similarity if you want
    const related = scored.map((s) => ({
      ...s.product,
      similarity: Number(s.score.toFixed(4)),
    }));

    res.json({ related });
  } catch (err) {
    console.error("relatedByEmbedding error:", err);
    res.status(500).json({ message: "Server error" });
  }
};