// middleware/upload.ts
import multer from "multer";
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // or configure to public path
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB
