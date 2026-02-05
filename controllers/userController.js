const User = require("../models/User");
const Order = require("../models/Order");
const Wishlist = require("../models/Wishlist");
const bcrypt = require("bcryptjs");

// ---------------- CUSTOMER ----------------
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await User.findById(userId);
    if (result.length === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;
    if (!name && !email && !password) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    let updateData = { name, email, role: undefined };
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    await User.update(userId, updateData);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAccount = (req, res) => {
  res.json({ msg: "account deleted (not implemented)" });
};

const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Order.getByUserId(userId);
    if (result.length === 0) {
      return res.status(200).json({ message: "No orders found", orders: [] });
    }
    res.status(200).json({ orders: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Wishlist.getByUserId(userId);
    if (result.length === 0) {
      return res.status(200).json({ message: "Wishlist is empty", wishlist: [] });
    }
    res.status(200).json({ wishlist: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- ADMIN ----------------
const getAllUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;
    let offset = (page - 1) * limit;

    const countResult = await User.countAll();
    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    const result = await User.getAll(limit, offset);
    res.status(200).json({
      page,
      limit,
      totalUsers,
      totalPages,
      users: result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await User.findById(userId);
    if (result.length === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;
    const result = await User.update(userId, { name, email, role });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const result = await User.update(userId, { role });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Role changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword) return res.status(400).json({ message: "Search keyword is required" });
    const results = await User.search(keyword);
    res.status(200).json({ total: results.length, users: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export all functions
module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  getOrderHistory,
  getWishlist,
  getAllUsers,
  getUserById,
  updateUser,
  changeUserRole,
  searchUsers
};
