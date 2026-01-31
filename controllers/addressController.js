const db = require("../config/db");

// GET user's saved addresses
const getUserAddresses = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
    [userId],
    (err, addresses) => {
      if (err) return res.status(500).json(err);

      res.json({
        total: addresses.length,
        addresses
      });
    }
  );
};




// ADD new address
const addNewAddress = (req, res) => {
  const userId = req.user.id;

  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    country,
    is_default
  } = req.body;

  // Basic validation
  if (!full_name || !phone || !address_line1 || !city || !state || !pincode) {
    return res.status(400).json({
      message: "Required fields missing"
    });
  }

  // If setting default address → unset old default
  if (is_default) {
    db.query(
      "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
      [userId]
    );
  }

  const query = `
    INSERT INTO addresses
    (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      userId,
      full_name,
      phone,
      address_line1,
      address_line2 || null,
      city,
      state,
      pincode,
      country || "India",
      is_default ? 1 : 0
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.status(201).json({
        message: "Address added successfully",
        addressId: result.insertId
      });
    }
  );
};


// UPDATE address
const updateAddress = (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  const {
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    country,
    is_default
  } = req.body;

  // Check address belongs to user
  db.query(
    "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
    [addressId, userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Address not found" });
      }

      // If new default → remove old default
      if (is_default) {
        db.query(
          "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
          [userId]
        );
      }

      const updateQuery = `
        UPDATE addresses SET
          full_name = ?,
          phone = ?,
          address_line1 = ?,
          address_line2 = ?,
          city = ?,
          state = ?,
          pincode = ?,
          country = ?,
          is_default = ?
        WHERE id = ? AND user_id = ?
      `;

      db.query(
        updateQuery,
        [
          full_name,
          phone,
          address_line1,
          address_line2 || null,
          city,
          state,
          pincode,
          country || "India",
          is_default ? 1 : 0,
          addressId,
          userId
        ],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({ message: "Address updated successfully" });
        }
      );
    }
  );
};

// SET default address
const setDefaultAddress = (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  // 1️⃣ Check address belongs to user
  db.query(
    "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
    [addressId, userId],
    (err, rows) => {
      if (err) return res.status(500).json(err);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Address not found" });
      }

      // 2️⃣ Remove old default
      db.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
        [userId],
        (err) => {
          if (err) return res.status(500).json(err);

          // 3️⃣ Set new default
          db.query(
            "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
            [addressId, userId],
            (err) => {
              if (err) return res.status(500).json(err);

              res.json({ message: "Default address updated successfully" });
            }
          );
        }
      );
    }
  );
};



module.exports = {
  getUserAddresses,
  addNewAddress,
  updateAddress,
  setDefaultAddress
};
