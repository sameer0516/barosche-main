const express = require("express");
const multer  = require("multer");
const path    = require("path");
const {
  addProduct, updateProduct,
  getAllProducts, getProductBySlug, deleteProduct,
} = require("../controller/productController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const allowedImageExt = /jpeg|jpg|png|gif|webp/;
const allowedVideoExt = /mp4|mov|webm|avi|mkv|m4v/;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isVariantVideoField = /^variantVideos_\d+$/.test(file.fieldname);

  if (isVariantVideoField) {
    const ok = allowedVideoExt.test(ext) && file.mimetype.startsWith("video/");
    return ok
      ? cb(null, true)
      : cb(new Error("Only video files allowed (mp4, mov, webm, avi, mkv, m4v)"), false);
  }

  const ok = allowedImageExt.test(ext) && file.mimetype.startsWith("image/");
  return ok
    ? cb(null, true)
    : cb(new Error("Only image files allowed (jpeg, jpg, png, gif, webp)"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 60,
  },
});

router.post("/upload", upload.any(), addProduct);
router.put("/:id",    upload.any(), updateProduct);
router.get("/",       getAllProducts);
router.get("/:slug",  getProductBySlug);
router.delete("/:id", deleteProduct);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return res.status(400).json({ success: false, message: "File too large. Max 100 MB allowed." });
    if (err.code === "LIMIT_FILE_COUNT")
      return res.status(400).json({ success: false, message: "Too many files." });
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) return res.status(400).json({ success: false, message: err.message });
  next();
});

module.exports = router;