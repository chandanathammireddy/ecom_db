const express = require("express");
const router = express.Router();

const { auth, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  getLowStockProducts,
  bulkUploadProducts,
  getAllCategories
} = require("../controllers/productController");

// Create product
router.post("/", auth, isAdmin, createProduct);

// Get products
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/categories", getAllCategories);
router.get("/category/:category", getProductsByCategory);
router.get("/low-stock", auth, isAdmin, getLowStockProducts);
router.get("/:id", getProductById);

// Update product
router.put("/:id", auth, isAdmin, updateProduct);

// Bulk upload (CSV only)
router.post(
  "/bulk-upload",
  auth,
  isAdmin,
  upload.single("file"),
  bulkUploadProducts
);

module.exports = router;
