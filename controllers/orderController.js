const db = require("../config/db");

// CREATE ORDER (checkout)
const createOrder = (req, res) => {
  const userId = req.user.id;

  db.query(
    "INSERT INTO orders (user_id, status) VALUES (?, 'pending')",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Order created successfully",
        orderId: result.insertId
      });
    }
  );
};

// GET user orders
const getUserOrders = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM orders WHERE user_id = ?",
    [userId],
    (err, orders) => {
      if (err) return res.status(500).json(err);
      res.json(orders);
    }
  );
};

// GET order details
const getOrderDetails = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  db.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId],
    (err, orders) => {
      if (err) return res.status(500).json(err);

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(orders[0]);
    }
  );
};

// CANCEL order (only pending)
const cancelOrder = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  db.query(
    "SELECT status FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId],
    (err, orders) => {
      if (err) return res.status(500).json(err);

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (orders[0].status !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending orders can be cancelled" });
      }

      db.query(
        "UPDATE orders SET status = 'cancelled' WHERE id = ?",
        [orderId],
        () => res.json({ message: "Order cancelled successfully" })
      );
    }
  );
};

// GET order invoice
const getOrderInvoice = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  // 1️⃣ Get order
  db.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId],
    (err, orders) => {
      if (err) return res.status(500).json(err);

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      const order = orders[0];

      // 2️⃣ Get order items
      const itemsQuery = `
        SELECT 
          oi.product_id,
          p.name,
          oi.quantity,
          oi.price,
          (oi.quantity * oi.price) AS total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;

      db.query(itemsQuery, [orderId], (err, items) => {
        if (err) return res.status(500).json(err);

        // 3️⃣ Calculate grand total
        const grandTotal = items.reduce(
          (sum, item) => sum + item.total,
          0
        );

        // 4️⃣ Invoice response
        res.json({
          invoice: {
            orderId: order.id,
            status: order.status,
            items,
            grandTotal
          }
        });
      });
    }
  );
};

// ADMIN: GET all orders with filters
const getAllOrders = (req, res) => {
  const { status, userId, fromDate, toDate } = req.query;

  let query = `
    SELECT 
      o.id,
      o.user_id,
      u.name AS user_name,
      u.email,
      o.status
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;

  const values = [];

  if (status) {
    query += " AND o.status = ?";
    values.push(status);
  }

  if (userId) {
    query += " AND o.user_id = ?";
    values.push(userId);
  }

  query += " ORDER BY o.id DESC";

  db.query(query, values, (err, orders) => {
    if (err) return res.status(500).json(err);

    res.json({
      total: orders.length,
      orders
    });
  });
};



// ADMIN: Update order status
const updateOrderStatus = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const allowedStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  db.query(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, orderId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({
        message: "Order status updated successfully",
        orderId,
        status
      });
    }
  );
};

// ADMIN: Update payment status
const updatePaymentStatus = (req, res) => {
  const orderId = req.params.id;
  const { payment_status } = req.body;

  if (!payment_status) {
    return res.status(400).json({ message: "Payment status is required" });
  }

  const allowedStatus = ["pending", "paid", "failed", "refunded"];

  if (!allowedStatus.includes(payment_status)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  db.query(
    "UPDATE orders SET payment_status = ? WHERE id = ?",
    [payment_status, orderId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({
        message: "Payment status updated successfully",
        orderId,
        payment_status
      });
    }
  );
};

const processPayment = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;
  const { payment_method } = req.body;

  if (!payment_method) {
    return res.status(400).json({ message: "Payment method required" });
  }

  // check order
  db.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId],
    (err, orders) => {
      if (err) return res.status(500).json(err);

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (orders[0].payment_status === "paid") {
        return res.status(400).json({ message: "Order already paid" });
      }

      // update payment
      db.query(
        `UPDATE orders 
         SET payment_status = 'paid',
             payment_method = ?,
             status = 'confirmed',
             paid_at = NOW()
         WHERE id = ?`,
        [payment_method, orderId],
        () => {
          res.json({
            message: "Payment successful",
            orderId,
            payment_status: "paid"
          });
        }
      );
    }
  );
};


// VERIFY PAYMENT (ADMIN / SYSTEM)
const verifyPayment = (req, res) => {
  const orderId = req.params.id;
  const { payment_status } = req.body; 
  // paid | failed

  if (!payment_status) {
    return res.status(400).json({ message: "payment_status required" });
  }

  db.query(
    "SELECT * FROM orders WHERE id = ?",
    [orderId],
    (err, orders) => {
      if (err) return res.status(500).json(err);

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      let orderStatus =
        payment_status === "paid" ? "confirmed" : "payment_failed";

      db.query(
        `UPDATE orders 
         SET payment_status = ?, 
             status = ?, 
             paid_at = ?
         WHERE id = ?`,
        [
          payment_status,
          orderStatus,
          payment_status === "paid" ? new Date() : null,
          orderId
        ],
        () => {
          res.json({
            message: "Payment verified successfully",
            orderId,
            payment_status,
            order_status: orderStatus
          });
        }
      );
    }
  );
};

// GET PAYMENT DETAILS
const getPaymentDetails = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  db.query(
    `SELECT 
        id AS order_id,
        status,
        payment_status,
        payment_method,
        paid_at,
        total
     FROM orders
     WHERE id = ? AND user_id = ?`,
    [orderId, userId],
    (err, orders) => {
      if (err) return res.status(500).json(err);

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({
        paymentDetails: orders[0]
      });
    }
  );
};

// ADMIN: PROCESS REFUND
const processRefund = (req, res) => {
  const orderId = req.params.id;

  // 1️⃣ Check order
  db.query(
    "SELECT payment_status, refund_status FROM orders WHERE id = ?",
    [orderId],
    (err, orders) => {
      if (err) return res.status(500).json(err);

      if (orders.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      const order = orders[0];

      // 2️⃣ Validate
      if (order.payment_status !== "paid") {
        return res
          .status(400)
          .json({ message: "Only paid orders can be refunded" });
      }

      if (order.refund_status === "refunded") {
        return res
          .status(400)
          .json({ message: "Order already refunded" });
      }

      // 3️⃣ Refund order
      db.query(
        `
        UPDATE orders 
        SET 
          refund_status = 'refunded',
          payment_status = 'refunded',
          status = 'refunded',
          refunded_at = NOW()
        WHERE id = ?
        `,
        [orderId],
        () => {
          res.json({
            message: "Refund processed successfully",
            orderId
          });
        }
      );
    }
  );
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
