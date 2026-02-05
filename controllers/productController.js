const Product = require("../models/Product");
const fs = require("fs");
const csv = require("csv-parser");

// Get all products with filters & pagination
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      keyword = "",
      category,
      minPrice,
      maxPrice
    } = req.query;

    const filters = {
      keyword,
      category,
      minPrice,
      maxPrice
    };

    const result = await Product.getAll(filters, Number(limit), (Number(page) - 1) * Number(limit));
    res.json({
      total: result.total,
      page: Number(page),
      limit: Number(limit),
      products: result.products
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await Product.findById(productId);
    if (result.length === 0) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.getFeatured();
    res.json({ total: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const products = await Product.getNewArrivals(limit);
    res.json({ total: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      is_featured = false
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Name, price and category are required"
      });
    }

    const result = await Product.create({ name, description, price, category, stock, is_featured });
    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.getByCategory(category);
    if (products.length === 0) {
      return res.status(200).json({ message: "No products found", products: [] });
    }
    res.status(200).json({ total: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    const { name, description, price, category, stock, is_featured, status } = req.body;
    if (!name && !description && price === undefined && !category && stock === undefined && is_featured === undefined && !status) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    if (status && status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ message: "Status must be 'active' or 'inactive'" });
    }

    const result = await Product.update(productId, updateData);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get low stock products (Admin)
exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const products = await Product.getLowStock(threshold);
    res.status(200).json({ threshold, total: products.length, products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk upload products (Admin)
exports.bulkUploadProducts = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "no file uploaded" });
  }

  let products = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      products.push([
        row.name,
        row.description,
        row.price,
        row.category,
        row.stock || 0,
        row.is_featured || 0,
        row.status || "active"
      ]);
    })
    .on("end", async () => {
      if (products.length === 0) return res.status(400).json({ message: "CSV is empty" });

      try {
        const result = await Product.bulkCreate(products);
        res.status(201).json({
          message: "Products uploaded successfully",
          inserted: result.affectedRows
        });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const results = await Product.getAllCategories();
    res.status(200).json({
      total: results.length,
      categories: results.map(row => row.category)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
