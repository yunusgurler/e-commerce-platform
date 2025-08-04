// minimal Interaction model
import mongoose from "mongoose";

const InteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  type: { type: String, enum: ["view", "purchase", "add_to_cart"] },
  timestamp: { type: Date, default: Date.now },
});

const Interaction =
  mongoose.models.Interaction ||
  mongoose.model("Interaction", InteractionSchema);
export default Interaction;
