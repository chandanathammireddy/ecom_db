const Order = require("../models/Order");

// CREATE ORDER (checkout)
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Order.create(userId);
    res.json({
      message: "Order created successfully",
      orderId: result.insertId
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.getByUserId(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET order details
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const orders = await Order.getByIdAndUser(orderId, userId);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });
    res.json(orders[0]);
  } catch (err) {
    res.status(500).json(err);
  }
};

// CANCEL order (only pending)
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const orders = await Order.getByIdAndUser(orderId, userId);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });
    if (orders[0].status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    await Order.updateStatus(orderId, 'cancelled');
    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET order invoice
const getOrderInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const orders = await Order.getByIdAndUser(orderId, userId);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

    const order = orders[0];
    const items = await Order.getWithItems(orderId);
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    res.json({
      invoice: {
        orderId: order.id,
        status: order.status,
        items,
        grandTotal
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADMIN: GET all orders with filters
const getAllOrders = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const orders = await Order.getAll({ status, userId });
    res.json({ total: orders.length, orders });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADMIN: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });
    const allowedStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowedStatus.includes(status)) return res.status(400).json({ message: "Invalid status value" });

    const result = await Order.updateStatus(orderId, status);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order status updated successfully", orderId, status });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADMIN: Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { payment_status } = req.body;
    if (!payment_status) return res.status(400).json({ message: "Payment status is required" });

    const allowedStatus = ["pending", "paid", "failed", "refunded"];
    if (!allowedStatus.includes(payment_status)) return res.status(400).json({ message: "Invalid payment status" });

    const result = await Order.updatePaymentStatus(orderId, payment_status);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Payment status updated successfully", orderId, payment_status });
  } catch (err) {
    res.status(500).json(err);
  }
};

const processPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const { payment_method } = req.body;

    if (!payment_method) return res.status(400).json({ message: "Payment method required" });

    const orders = await Order.getByIdAndUser(orderId, userId);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });
    if (orders[0].payment_status === "paid") return res.status(400).json({ message: "Order already paid" });

    await Order.processPayment(orderId, payment_method);
    res.json({ message: "Payment successful", orderId, payment_status: "paid" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// VERIFY PAYMENT (ADMIN / SYSTEM)
const verifyPayment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { payment_status } = req.body;

    if (!payment_status) return res.status(400).json({ message: "payment_status required" });

    const orders = await Order.getById(orderId);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

    let orderStatus = payment_status === "paid" ? "confirmed" : "payment_failed";
    await Order.verifyPayment(orderId, payment_status, orderStatus, payment_status === "paid" ? new Date() : null);
    res.json({ message: "Payment verified successfully", orderId, payment_status, order_status: orderStatus });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET PAYMENT DETAILS
const getPaymentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const orders = await Order.getByIdAndUser(orderId, userId);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ paymentDetails: orders[0] });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADMIN: PROCESS REFUND
const processRefund = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orders = await Order.getById(orderId);
    if (orders.length === 0) return res.status(404).json({ message: "Order not found" });

    const order = orders[0];
    if (order.payment_status !== "paid") return res.status(400).json({ message: "Only paid orders can be refunded" });
    if (order.refund_status === "refunded") return res.status(400).json({ message: "Order already refunded" });

    await Order.processRefund(orderId);
    res.json({ message: "Refund processed successfully", orderId });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
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
  processRefund
};
