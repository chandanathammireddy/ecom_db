// ---------------- CUSTOMER ----------------
const getProfile = (req, res) => res.json({ msg: "profile" });
const updateProfile = (req, res) => res.json({ msg: "profile updated" });
const deleteAccount = (req, res) => res.json({ msg: "account deleted" });
const getOrderHistory = (req, res) => res.json({ msg: "order history" });
const getWishlist = (req, res) => res.json({ msg: "wishlist" });

// ---------------- ADMIN ----------------
const getAllUsers = (req, res) => res.json({ msg: "all users" });
const getUserById = (req, res) => res.json({ msg: "user by id" });
const updateUser = (req, res) => res.json({ msg: "user updated" });
const changeUserRole = (req, res) => res.json({ msg: "role changed" });
const searchUsers = (req, res) => res.json({ msg: "search users" });

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
