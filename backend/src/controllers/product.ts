import { Request, Response } from "express";
import Product from "../models/Product";
import Category from "../models/Category";
import { createProductSchema, updateProductSchema } from "../utils/validators";
import { z } from "zod";
import mongoose from "mongoose";
import { ensureProductEmbedding } from '../services/embeddings'; // export the function

// List with filters, pagination, sorting
export const listProducts = async (req: Request, res: Response) => {
  const { search, category, sort, page = "1", limit = "20" } = req.query;

  const filter: any = {};
  if (search) filter.name = { $regex: String(search), $options: "i" };
  if (category) filter.category = String(category);

  let query = Product.find(filter).populate("category");
  if (sort) {
    const [field, direction] = String(sort).split(":");
    query = query.sort({ [field]: direction === "asc" ? 1 : -1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const pageNum = parseInt(String(page), 10);
  const limNum = Math.min(parseInt(String(limit), 10), 100);
  const skip = (pageNum - 1) * limNum;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    query.skip(skip).limit(limNum),
  ]);

  res.json({
    meta: {
      total,
      page: pageNum,
      limit: limNum,
      pages: Math.ceil(total / limNum),
    },
    products,
  });
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid ID" });

  const product = await Product.findById(id).populate("category");
  if (!product) return res.status(404).json({ message: "Not found" });

  res.json(product);
};

export const createProduct = async (req, res) => {
  const payload = req.body;
  const product = await Product.create(payload);
  // asynchronously create embedding (don’t block the response if you want speed)
  ensureProductEmbedding(product._id.toString()).catch(console.error);
  res.status(201).json({ product });
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Not found" });
  await ensureProductEmbedding(product._id.toString());
  res.json({ product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid ID" });

  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  const products = await Product.find({ featured: true }).limit(12);
  res.json(products);
};

export const getNewArrivals = async (req: Request, res: Response) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(12);
  res.json(products);
};

export const getPopularProducts = async (req: Request, res: Response) => {
  // fallback: by reviewCount descending
  const products = await Product.find().sort({ reviewCount: -1 }).limit(12);
  res.json(products);
};
