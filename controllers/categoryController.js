const db = require("../config/db");

// Get category by ID
exports.getCategoryById = (req, res) => {
  const categoryId = req.params.id;

  const query = "SELECT * FROM categories WHERE id = ?";

  db.query(query, [categoryId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(result[0]);
  });
};

// Create new category (Admin)
exports.createCategory = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const query = "INSERT INTO categories (name) VALUES (?)";

  db.query(query, [name], (err, result) => {
    if (err) {
      // Duplicate category error
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Category already exists" });
      }
      return res.status(500).json({ message: err.message });
    }

    res.status(201).json({
      message: "Category created successfully",
      categoryId: result.insertId
    });
  });
};

// Update category by ID (Admin)

exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;

  let fields = [];
  let values = [];

  if (name) {
    fields.push("name = ?");
    values.push(name);
  }

  if (status) {
    fields.push("status = ?");
    values.push(status);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  values.push(id);

  const query = `
    UPDATE categories
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category updated successfully" });
  });
};
