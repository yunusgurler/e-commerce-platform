import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  size: String,
  color: String,
  additionalPrice: { type: Number, default: 0 },
  inventoryCount: { type: Number, default: 0 },
});

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [String],
    featured: { type: Boolean, default: false },
    specifications: mongoose.Schema.Types.Mixed,
    variants: [VariantSchema],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    inventoryCount: { type: Number, default: 0 },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;
