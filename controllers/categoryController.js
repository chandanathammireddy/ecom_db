const Category = require("../models/Category");

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const result = await Category.getById(categoryId);
    if (result.length === 0) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new category (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const result = await Category.create(name);
    res.status(201).json({ message: "Category created successfully", categoryId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Category already exists" });
    res.status(500).json({ message: err.message });
  }
};

// Update category by ID (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const result = await Category.update(id, name, status);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
