import app from "./app";
import connectDB from "./config/db";
import dotenv from "dotenv";

dotenv.config();

console.log("ENV CHECK:", {
  USE_ETHEREAL: process.env.USE_ETHEREAL,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER ? "[set]" : "[missing]",
});

const PORT = process.env.PORT || 4000;

(async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
