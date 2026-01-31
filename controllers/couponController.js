const db = require("../config/db");

// VALIDATE coupon
const validateCoupon = (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code || !cartTotal) {
    return res.status(400).json({
      message: "Coupon code and cart total are required"
    });
  }

  const query = `
    SELECT *
    FROM coupons
    WHERE code = ?
      AND is_active = 1
      AND (expires_at IS NULL OR expires_at >= NOW())
  `;

  db.query(query, [code], (err, coupons) => {
    if (err) return res.status(500).json(err);

    if (coupons.length === 0) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    const coupon = coupons[0];

    // Check minimum order value
    if (cartTotal < coupon.min_order_value) {
      return res.status(400).json({
        message: `Minimum order value should be ₹${coupon.min_order_value}`
      });
    }

    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount = (cartTotal * coupon.discount_value) / 100;

      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
    }

    const finalAmount = cartTotal - discount;

    res.json({
      coupon: coupon.code,
      discount,
      finalAmount
    });
  });
};


// GET available coupons
const getAvailableCoupons = (req, res) => {
  const query = `
    SELECT 
      id,
      code,
      discount_type,
      discount_value,
      min_order_value,
      max_discount,
      expires_at
    FROM coupons
    WHERE is_active = 1
      AND (expires_at IS NULL OR expires_at >= NOW())
    ORDER BY expires_at ASC
  `;

  db.query(query, (err, coupons) => {
    if (err) return res.status(500).json(err);

    res.json({
      total: coupons.length,
      coupons
    });
  });
};

// CREATE COUPON (ADMIN)
const createCoupon = (req, res) => {
  const {
    code,
    discount_type,
    discount_value,
    min_order_value,
    max_discount,
    expires_at
  } = req.body;

  if (!code || !discount_type || !discount_value) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const query = `
    INSERT INTO coupons
    (code, discount_type, discount_value, min_order_value, max_discount, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      code,
      discount_type,
      discount_value,
      min_order_value || 0,
      max_discount || null,
      expires_at || null
    ],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Coupon code already exists" });
        }
        return res.status(500).json(err);
      }

      res.json({
        message: "Coupon created successfully",
        couponId: result.insertId
      });
    }
  );
};

// UPDATE COUPON (ADMIN)
const updateCoupon = (req, res) => {
  const couponId = req.params.id;

  const {
    code,
    discount_type,
    discount_value,
    min_order_value,
    max_discount,
    expires_at,
    is_active
  } = req.body;

  const query = `
    UPDATE coupons SET
      code = ?,
      discount_type = ?,
      discount_value = ?,
      min_order_value = ?,
      max_discount = ?,
      expires_at = ?,
      is_active = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [
      code,
      discount_type,
      discount_value,
      min_order_value || 0,
      max_discount || null,
      expires_at || null,
      is_active ?? 1,
      couponId
    ],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Coupon code already exists" });
        }
        return res.status(500).json(err);
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json({ message: "Coupon updated successfully" });
    }
  );
};

// GET ALL COUPONS (ADMIN)
const getAllCoupons = (req, res) => {
  db.query(
    "SELECT * FROM coupons ORDER BY id DESC",
    (err, coupons) => {
      if (err) return res.status(500).json(err);

      res.json({
        total: coupons.length,
        coupons
      });
    }
  );
};

module.exports = {
  validateCoupon,
  getAvailableCoupons,
  createCoupon,
  updateCoupon,
  getAllCoupons
};
