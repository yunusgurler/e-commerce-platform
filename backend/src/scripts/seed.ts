// scripts/seed.ts
import dotenv from "dotenv";
import connectDB from "../../src/config/db";
import Category from "../../src/models/Category";
import User from "../../src/models/User";
import Product from "../../src/models/Product";
import Order from "../../src/models/Order";
import bcrypt from "bcrypt";
import { ensureProductEmbedding } from "../services/embeddings";

dotenv.config();

const dummyProducts = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation and 30h battery life.",
    price: 199.99,
    categoryName: "Electronics",
    images: ["http://picsum.photos/seed/headphone/400/300"],
    tags: ["audio", "wireless", "noise-cancelling"],
    featured: true,
    specifications: {
      batteryLife: "30h",
      connectivity: "Bluetooth 5.2",
      color: "Black",
    },
    variants: [
      {
        size: "Standard",
        color: "Black",
        additionalPrice: 0,
        inventoryCount: 120,
      },
    ],
    inventoryCount: 120,
    averageRating: 4.5,
    reviewCount: 210,
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Soft and breathable t-shirt made from 100% organic cotton.",
    price: 29.5,
    categoryName: "Clothing",
    images: ["http://picsum.photos/seed/tshirt/400/300"],
    tags: ["organic", "casual", "eco-friendly"],
    featured: false,
    specifications: { material: "Organic Cotton", fit: "Regular" },
    variants: [
      { size: "S", color: "White", inventoryCount: 60 },
      { size: "M", color: "White", inventoryCount: 80 },
      { size: "L", color: "White", inventoryCount: 50 },
    ],
    inventoryCount: 190,
    averageRating: 4.2,
    reviewCount: 89,
  },
  {
    name: "Stainless Steel Kitchen Knife Set",
    description:
      "5-piece professional knife set with ergonomic handles and storage block.",
    price: 89.0,
    categoryName: "Home and Garden",
    images: ["http://picsum.photos/seed/knife/400/300"],
    tags: ["kitchen", "cutlery", "professional"],
    featured: true,
    specifications: { pieces: 5, material: "Stainless Steel" },
    variants: [],
    inventoryCount: 45,
    averageRating: 4.8,
    reviewCount: 142,
  },
  {
    name: "Yoga Mat with Carry Strap",
    description:
      "Non-slip yoga mat, lightweight and easy to carry, ideal for home and studio practice.",
    price: 39.99,
    categoryName: "Sports",
    images: ["http://picsum.photos/seed/yogamat/400/300"],
    tags: ["fitness", "yoga", "non-slip"],
    featured: false,
    specifications: { thickness: "6mm", dimensions: "72x24 inches" },
    variants: [
      { color: "Purple", inventoryCount: 100 },
      { color: "Blue", inventoryCount: 90 },
    ],
    inventoryCount: 190,
    averageRating: 4.3,
    reviewCount: 67,
  },
  {
    name: "Bestselling Mystery Novel",
    description:
      "A gripping mystery that keeps you on the edge of your seat till the last page.",
    price: 14.99,
    categoryName: "Books",
    images: ["http://picsum.photos/seed/book/400/300"],
    tags: ["mystery", "bestseller", "fiction"],
    featured: true,
    specifications: { pages: 384, author: "J. Doe", format: "Paperback" },
    variants: [],
    inventoryCount: 300,
    averageRating: 4.7,
    reviewCount: 540,
  },
  {
    name: "Vitamin C Serum",
    description:
      "Brightening facial serum with stabilized vitamin C and hyaluronic acid.",
    price: 24.5,
    categoryName: "Health and Beauty",
    images: ["http://picsum.photos/seed/serum/400/300"],
    tags: ["skincare", "brightening", "antioxidant"],
    featured: false,
    specifications: { volume: "30ml", suitableFor: "All skin types" },
    variants: [],
    inventoryCount: 150,
    averageRating: 4.1,
    reviewCount: 98,
  },
  {
    name: "Educational Building Blocks Set",
    description:
      "Creative building blocks for kids age 3+, encourages STEM learning.",
    price: 49.99,
    categoryName: "Toys",
    images: ["http://picsum.photos/seed/blocks/400/300"],
    tags: ["educational", "kids", "STEM"],
    featured: true,
    specifications: { pieces: 120, ageRange: "3+" },
    variants: [],
    inventoryCount: 80,
    averageRating: 4.6,
    reviewCount: 130,
  },
  {
    name: "Gourmet Olive Oil",
    description:
      "Extra virgin olive oil from organic farms, cold-pressed for maximum flavor.",
    price: 18.0,
    categoryName: "Food",
    images: ["http://picsum.photos/seed/oliveoil/400/300"],
    tags: ["gourmet", "organic", "cooking"],
    featured: false,
    specifications: { volume: "500ml", origin: "Italy" },
    variants: [],
    inventoryCount: 220,
    averageRating: 4.9,
    reviewCount: 75,
  },
  {
    name: "Smart LED Desk Lamp",
    description:
      "Adjustable smart lamp with color temperature control and USB charging.",
    price: 59.99,
    categoryName: "Electronics",
    images: ["http://picsum.photos/seed/desklamp/400/300"],
    tags: ["lighting", "smart", "desk"],
    featured: false,
    specifications: { brightnessLevels: 5, powerSource: "USB" },
    variants: [],
    inventoryCount: 95,
    averageRating: 4.4,
    reviewCount: 54,
  },
  {
    name: "Running Sneakers",
    description:
      "Lightweight running shoes with breathable mesh and cushioned sole.",
    price: 120.0,
    categoryName: "Sports",
    images: ["http://picsum.photos/seed/sneakers/400/300"],
    tags: ["running", "fitness", "men"],
    featured: true,
    specifications: { material: "Mesh", sole: "Cushioned" },
    variants: [
      { size: "9", color: "Black", inventoryCount: 30 },
      { size: "10", color: "Black", inventoryCount: 25 },
    ],
    inventoryCount: 55,
    averageRating: 4.5,
    reviewCount: 210,
  },
];

const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const orderStatuses = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
    if (!process.env.OPENAI_API_KEY) {
      console.warn("WARNING: OPENAI_API_KEY not set; embeddings will fail.");
    }

    await connectDB(process.env.MONGO_URI!);

    // categories
    const names = [
      "Electronics",
      "Clothing",
      "Home and Garden",
      "Sports",
      "Books",
      "Health and Beauty",
      "Toys",
      "Food",
    ];
    const categoryImageMap: Record<string, string> = {
      Electronics: "https://picsum.photos/seed/electronics/300/200",
      Clothing: "https://picsum.photos/seed/clothing/300/200",
      "Home and Garden": "https://picsum.photos/seed/homegarden/300/200",
      Sports: "https://picsum.photos/seed/sports/300/200",
      Books: "https://picsum.photos/seed/books/300/200",
      "Health and Beauty": "https://picsum.photos/seed/beauty/300/200",
      Toys: "https://picsum.photos/seed/toys/300/200",
      Food: "https://picsum.photos/seed/food/300/200",
    };

    const categoryMap: Record<string, any> = {};
    for (const [i, name] of names.entries()) {
      const cat = await Category.findOneAndUpdate(
        { name },
        {
          name,
          description: `${name} category`,
          image:
            categoryImageMap[name] ||
            `https://picsum.photos/seed/${name.replace(/\s+/g, "")}/300/200`,
          isActive: true,
          sortOrder: i,
        },
        { upsert: true, new: true }
      );
      categoryMap[name] = cat;
    }

    // admin & demo users
    const adminEmail = "admin@example.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash("Password123!", 12);
      admin = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        passwordHash,
        role: "admin",
        isEmailVerified: true,
      });
      console.log("Created admin user:", adminEmail);
    }

    const userEmail = "user@example.com";
    let demoUser = await User.findOne({ email: userEmail });
    if (!demoUser) {
      const passwordHash = await bcrypt.hash("Password123!", 12);
      demoUser = await User.create({
        firstName: "Demo",
        lastName: "Customer",
        email: userEmail,
        passwordHash,
        role: "customer",
        isEmailVerified: true,
      });
      console.log("Created demo customer:", userEmail);
    }

    // products
    for (const item of dummyProducts as any[]) {
      const category = categoryMap[item.categoryName];
      if (!category) continue;

      let product = await Product.findOne({ name: item.name });
      if (!product) {
        product = await Product.create({
          name: item.name,
          description: item.description,
          price: item.price,
          images: item.images,
          category: category._id,
          tags: item.tags,
          featured: item.featured,
          specifications: item.specifications,
          variants: item.variants,
          inventoryCount: item.inventoryCount,
          averageRating: item.averageRating,
          reviewCount: item.reviewCount,
        });
        console.log("Seeded product:", item.name);
      } else {
        console.log("Product already exists, skipping:", item.name);
      }

      // ensure embedding (non-blocking but you can await if you prefer sequential)
      try {
        await ensureProductEmbedding(product._id.toString());
        console.log("Ensured embedding for:", product.name);
      } catch (e) {
        console.warn("Embedding failed for", product.name, e);
      }
    }

    // dummy orders (20)
    const customers = await User.find({ role: "customer" });
    const products = await Product.find().limit(10);
    for (let i = 0; i < 20; i++) {
      const customer = rand(customers);
      const item = rand(products) as any;
      const quantity = Math.ceil(Math.random() * 3);
      const total = item.price * quantity;
      const status = rand(orderStatuses);
      const existing = await Order.findOne({
        userId: customer._id,
        "items.0.product": item._id,
        status,
      });
      if (existing) continue;

      await Order.create({
        userId: customer._id,
        items: [
          {
            product: item._id,
            name: item.name,
            price: item.price,
            quantity,
          },
        ],
        total,
        shippingAddress: {
          line1: "123 Demo St",
          city: "Istanbul",
          postalCode: "34000",
          country: "TR",
        },
        status: status === "cancelled" ? "pending" : status,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
        ),
      });
    }

    console.log("Seeding done");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
})();
