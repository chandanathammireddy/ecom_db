const db = require("../config/db");

// Get all products with filters & pagination
exports.getAllProducts = (req, res) => {
  const {
    page = 1,
    limit = 5,
    keyword = "",
    category,
    minPrice,
    maxPrice
  } = req.query;

  let conditions = [];
  let values = [];

  // 🔍 Search by name OR description
  if (keyword) {
    conditions.push("(name LIKE ? OR description LIKE ?)");
    values.push(`%${keyword}%`, `%${keyword}%`);
  }

  // 📂 Filter by category
  if (category) {
    conditions.push("category = ?");
    values.push(category);
  }

  // 💰 Min price
  if (minPrice) {
    conditions.push("price >= ?");
    values.push(minPrice);
  }

  // 💰 Max price
  if (maxPrice) {
    conditions.push("price <= ?");
    values.push(maxPrice);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const offset = (page - 1) * limit;

  const productQuery = `
    SELECT *
    FROM products
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(
    productQuery,
    [...values, Number(limit), Number(offset)],
    (err, products) => {
      if (err) return res.status(500).json({ message: err.message });

      const countQuery = `
        SELECT COUNT(*) AS total
        FROM products
        ${whereClause}
      `;

      db.query(countQuery, values, (err, countResult) => {
        if (err) return res.status(500).json({ message: err.message });

        res.json({
          total: countResult[0].total,
          page: Number(page),
          limit: Number(limit),
          products
        });
      });
    }
  );
};


  

// Get single product by ID
exports.getProductById = (req, res) => {
  const productId = req.params.id;

  const query = "SELECT * FROM products WHERE id = ?";

  db.query(query, [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(result[0]);
  });
};

// Get featured products
exports.getFeaturedProducts = (req, res) => {
  const query = `
    SELECT *
    FROM products
    WHERE is_featured = 1
    ORDER BY created_at DESC
  `;

  db.query(query, (err, products) => {
    if (err) return res.status(500).json({ message: err.message });

    res.json({
      total: products.length,
      products
    });
  });
};

// Get new arrivals
exports.getNewArrivals = (req, res) => {
  const limit = Number(req.query.limit) || 5;

  const query = `
    SELECT *
    FROM products
    ORDER BY created_at DESC
    LIMIT ?
  `;

  db.query(query, [limit], (err, products) => {
    if (err) return res.status(500).json({ message: err.message });

    res.json({
      total: products.length,
      products
    });
  });
};

// Create new product (Admin)
exports.createProduct = (req, res) => {
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

  const query = `
    INSERT INTO products
    (name, description, price, category, stock, is_featured)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      name,
      description,
      price,
      category,
      stock || 0,
      is_featured
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(201).json({
        message: "Product created successfully",
        productId: result.insertId
      });
    }
  );
};

// Get products by category
exports.getProductsByCategory = (req, res) => {
  const category = req.params.category;

  const query = "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC";

  db.query(query, [category], (err, products) => {
    if (err) return res.status(500).json({ message: err.message });

    if (products.length === 0) {
      return res.status(200).json({ message: "No products found", products: [] });
    }

    res.status(200).json({
      total: products.length,
      products
    });
  });
};


// Update a product (Admin)
exports.updateProduct = (req, res) => {
  const productId = req.params.id;
  const { name, description, price, category, stock, is_featured, status } = req.body;

  let fields = [];
  let values = [];

  if (name) { fields.push("name = ?"); values.push(name); }
  if (description) { fields.push("description = ?"); values.push(description); }
  if (price !== undefined) { fields.push("price = ?"); values.push(price); }
  if (category) { fields.push("category = ?"); values.push(category); }
  if (stock !== undefined) { fields.push("stock = ?"); values.push(stock); }
  if (is_featured !== undefined) { fields.push("is_featured = ?"); values.push(is_featured); }

  // Inside updateProduct, after other fields
if (status) { 
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ message: "Status must be 'active' or 'inactive'" });
  }
  fields.push("status = ?");
  values.push(status);
}


  if (stock !== undefined) { fields.push("stock = ?"); values.push(stock); }


  if (fields.length === 0) {
    return res.status(400).json({ message: "Provide at least one field to update" });
  }

  const query = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
  values.push(productId);

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully" });
  });
};

// Get low stock products (Admin)
exports.getLowStockProducts = (req, res) => {
  const threshold = Number(req.query.threshold) || 5; // default = 5

  const query = `
    SELECT id, name, stock, category, status
    FROM products
    WHERE stock <= ? AND status = 'active'
    ORDER BY stock ASC
  `;

  db.query(query, [threshold], (err, products) => {
    if (err) return res.status(500).json({ message: err.message });

    res.status(200).json({
      threshold,
      total: products.length,
      products
    });
  });
};

const fs = require("fs");
const csv = require("csv-parser");

// Bulk upload products (Admin)
exports.bulkUploadProducts = (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
  if (!req.file) {
    return res.status(400).json({ message: "no file uploaded" });
  }
  console.log("uploaded file:",req.file.originalname);

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
    .on("end", () => {
      const query = `
        INSERT INTO products
        (name, description, price, category, stock, is_featured, status)
        VALUES ?
      `;

      db.query(query, [products], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });

        res.status(201).json({
          message: "Products uploaded successfully",
          inserted: result.affectedRows
        });
      });
    });
};

// Get all categories
exports.getAllCategories = (req, res) => {
  const query = `
    SELECT DISTINCT category
    FROM products
    WHERE category IS NOT NULL
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(200).json({
      total: results.length,
      categories: results.map(row => row.category)
    });
  });
};
