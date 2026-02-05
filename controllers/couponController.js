const Coupon = require("../models/Coupon");

// VALIDATE coupon
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code || !cartTotal) return res.status(400).json({ message: "Coupon code and cart total are required" });

    const coupons = await Coupon.findByCode(code);
    if (coupons.length === 0) return res.status(400).json({ message: "Invalid or expired coupon" });

    const coupon = coupons[0];
    if (cartTotal < coupon.min_order_value) {
      return res.status(400).json({ message: `Minimum order value should be ₹${coupon.min_order_value}` });
    }

    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (cartTotal * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
    } else {
      discount = coupon.discount_value;
    }

    const finalAmount = cartTotal - discount;
    res.json({ coupon: coupon.code, discount, finalAmount });

  } catch (err) {
    res.status(500).json(err);
  }
};

// GET available coupons
const getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.getAllAvailable();
    res.json({ total: coupons.length, coupons });
  } catch (err) {
    res.status(500).json(err);
  }
};

// CREATE COUPON (ADMIN)
const createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value } = req.body;
    if (!code || !discount_type || !discount_value) return res.status(400).json({ message: "Required fields missing" });

    const result = await Coupon.create(req.body);
    res.json({ message: "Coupon created successfully", couponId: result.insertId });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Coupon code already exists" });
    res.status(500).json(err);
  }
};

// UPDATE COUPON (ADMIN)
const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const result = await Coupon.update(couponId, req.body);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon updated successfully" });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Coupon code already exists" });
    res.status(500).json(err);
  }
};

// GET ALL COUPONS (ADMIN)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.getAll();
    res.json({ total: coupons.length, coupons });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  validateCoupon,
  getAvailableCoupons,
  createCoupon,
  updateCoupon,
  getAllCoupons
};
