// controllers/admin.ts
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import { Request, Response } from "express";
import mongoose from "mongoose";

export const getDashboardStats = async (req: Request, res: Response) => {
  const totalSalesAgg = await Order.aggregate([
    { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$total" },
        orderCount: { $sum: 1 },
      },
    },
  ]);
  const customerCount = await User.countDocuments({ role: "customer" });
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId");
  const popularProducts = await Product.find()
    .sort({ reviewCount: -1 })
    .limit(5);

  // Sales trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const salesTrend = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $in: ["paid", "shipped", "delivered"] },
      },
    },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        sales: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.day": 1 } },
  ]);

  // Order status distribution
  const statusDist = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({
    totalSales: totalSalesAgg[0]?.totalSales || 0,
    orderCount: totalSalesAgg[0]?.orderCount || 0,
    customerCount,
    recentOrders,
    popularProducts,
    salesTrend,
    statusDist,
  });
};
