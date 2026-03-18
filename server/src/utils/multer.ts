import multer from "multer";
import fs from "fs";
import path from "path";

/**
 * Multer configuration — handles file uploads (images only).
 * Uploaded files are saved to the /uploads folder on the server disk.
 * Express then serves that folder as static files via /uploads route.
 *
 * Usage: import upload from "../utils/multer"
 *        then use upload.single("fieldName") as route middleware.
 */

// Resolve the uploads directory relative to where the server process runs
const uploadDir = path.resolve("uploads");

// Create the folder if it doesn't exist yet (e.g. fresh clone)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// diskStorage saves files to disk (vs memoryStorage which keeps them in RAM)
const storage = multer.diskStorage({
  // Where to save the file
  destination: (_req, _file, cb) => cb(null, uploadDir),
  // Filename: timestamp + random number + original extension (e.g. 1700000000000-123456789.jpg)
  // Random suffix prevents collisions when two users upload at the same millisecond
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// Export the configured multer instance — 5 MB limit, images only
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export default upload;
