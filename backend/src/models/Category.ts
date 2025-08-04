import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    image: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
export default Category;
