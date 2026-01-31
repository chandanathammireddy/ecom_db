const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/authMiddleware");
const { validateCoupon } = require("../controllers/couponController");
const {getAvailableCoupons} = require("../controllers/couponController");
const { createCoupon } = require("../controllers/couponController");
const {updateCoupon} = require("../controllers/couponController");
const {getAllCoupons} = require("../controllers/couponController");


// GET all coupons (ADMIN)
router.get("/", auth, isAdmin, getAllCoupons);

// CREATE coupon
router.post("/", auth, isAdmin, createCoupon);

// UPDATE coupon
router.put("/:id", auth, isAdmin, updateCoupon);

// GET available coupons
router.get("/", auth, getAvailableCoupons);

// Validate coupon
router.post("/validate", auth, validateCoupon);

module.exports = router;
