const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Signup controller
exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  // ✅ Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // ✅ Check if user already exists
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // ✅ Insert user into database
    const insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      return res.status(201).json({ message: "User registered successfully" });
    });
  });
};


// Login controller
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Check if user exists
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result[0];

    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
};


// Get own profile
exports.getProfile = (req, res) => {
  const userId = req.user.id;

  const query = "SELECT id, name, email, role FROM users WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.length === 0) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(result[0]);
  });
};


// Update own profile
exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body;

  // Check if anything is provided to update
  if (!name && !email && !password) {
    return res.status(400).json({ message: "Provide at least one field to update" });
  }

  // Build query dynamically
  let fields = [];
  let values = [];

  if (name) {
    fields.push("name = ?");
    values.push(name);
  }
  if (email) {
    fields.push("email = ?");
    values.push(email);
  }
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    fields.push("password = ?");
    values.push(hashedPassword);
  }

  values.push(userId);

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    return res.status(200).json({ message: "Profile updated successfully" });
  });
};


// Get own order history
exports.getOwnOrders = (req, res) => {
  const userId = req.user.id;

  const query = "SELECT id, product_name, quantity, total_price, created_at FROM orders WHERE user_id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.length === 0) {
      return res.status(200).json({ message: "No orders found", orders: [] });
    }

    return res.status(200).json({ orders: result });
  });
};


// Get own wishlist
exports.getWishlist = (req, res) => {
  const userId = req.user.id;

  const query = "SELECT id, product_name, added_at FROM wishlist WHERE user_id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.length === 0) {
      return res.status(200).json({ message: "Wishlist is empty", wishlist: [] });
    }

    return res.status(200).json({ wishlist: result });
  });
};


// Get all users with pagination
exports.getAllUsers = (req, res) => {
  let page = parseInt(req.query.page) || 1;      // default page 1
  let limit = parseInt(req.query.limit) || 5;    // default 5 users per page
  let offset = (page - 1) * limit;

  // Count total users
  const countQuery = "SELECT COUNT(*) AS total FROM users";
  db.query(countQuery, (err, countResult) => {
    if (err) return res.status(500).json({ message: err.message });

    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with limit & offset
    const query = "SELECT id, name, email, role FROM users LIMIT ? OFFSET ?";
    db.query(query, [limit, offset], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      res.status(200).json({
        page,
        limit,
        totalUsers,
        totalPages,
        users: result
      });
    });
  });
};

// Get specific user by ID (Admin)
exports.getUserById = (req, res) => {
  const userId = req.params.id;

  const query = "SELECT id, name, email, role FROM users WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result[0]);
  });
};

// Update user by ID (Admin)
exports.updateUserById = (req, res) => {
  const userId = req.params.id;
  const { name, email, role } = req.body;

  const query = `
    UPDATE users 
    SET 
      name = ?, 
      email = ?, 
      role = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [name, email, role, userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User updated successfully" });
    }
  );
};

// Search users by name or email (Admin)
exports.searchUsers = (req, res) => {
  const keyword = req.query.keyword;

  if (!keyword) {
    return res.status(400).json({ message: "Search keyword is required" });
  }

  const query = `
    SELECT id, name, email, role
    FROM users
    WHERE name LIKE ? OR email LIKE ?
  `;

  const value = `%${keyword}%`;

  db.query(query, [value, value], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    res.status(200).json({
      total: results.length,
      users: results
    });
  });
};
