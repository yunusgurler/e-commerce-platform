import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  label: String,
  line1: String,
  city: String,
  postalCode: String,
  country: String,
  phone: String,
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    resetPasswordToken: String,
    addresses: [AddressSchema],
    favoriteCategories: [String],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
