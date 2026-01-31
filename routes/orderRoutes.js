const express = require("express");
const router = express.Router();

const { auth, isAdmin } = require("../middleware/authMiddleware");
const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  getOrderInvoice,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  processPayment,
  verifyPayment,
  getPaymentDetails,
  processRefund,
} = require("../controllers/orderController");

// USER
router.post("/checkout", auth, createOrder);
router.get("/my-orders", auth, getUserOrders);
router.get("/:id", auth, getOrderDetails);
router.put("/cancel/:id", auth, cancelOrder);
router.get("/invoice/:id", auth, getOrderInvoice);
router.put("/:id/status", auth, isAdmin, updateOrderStatus);
router.put("/:id/payment-status", auth, isAdmin, updatePaymentStatus);
router.put("/:id/pay", auth, processPayment);
router.put("/:id/verify-payment", auth, isAdmin, verifyPayment);
router.get("/:id/payment", auth, getPaymentDetails);
router.put("/refund/:id", auth, isAdmin, processRefund);





// ADMIN
router.get("/", auth, isAdmin, getAllOrders);

module.exports = router;

