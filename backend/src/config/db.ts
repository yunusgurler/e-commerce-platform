import mongoose from "mongoose";

const connectDB = async (uri: string) => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(uri);
  console.log("🗄️  MongoDB connected");
};

export default connectDB;
