const db = require("../config/db");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");



const getDashboardStats = (req, res) => {
  const stats = {};

  // 1. Total Users
  db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, users) => {
    if (err) return res.status(500).json(err);
    stats.totalUsers = users[0].totalUsers;

    // 2. Total Orders
    db.query("SELECT COUNT(*) AS totalOrders FROM orders", (err, orders) => {
      if (err) return res.status(500).json(err);
      stats.totalOrders = orders[0].totalOrders;

      // 3. Pending Orders
      db.query(
        "SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'pending'",
        (err, pending) => {
          if (err) return res.status(500).json(err);
          stats.pendingOrders = pending[0].pendingOrders;

          // 4. Today's Orders
          db.query(
            "SELECT COUNT(*) AS todaysOrders FROM orders WHERE DATE(created_at) = CURDATE()",
            (err, today) => {
              if (err) return res.status(500).json(err);
              stats.todaysOrders = today[0].todaysOrders;

              // 5. Total Revenue (PAID)
              db.query(
                "SELECT IFNULL(SUM(total),0) AS totalRevenue FROM orders WHERE payment_status = 'paid'",
                (err, revenue) => {
                  if (err) return res.status(500).json(err);
                  stats.totalRevenue = revenue[0].totalRevenue;

                  // 6. Total Products
                  db.query(
                    "SELECT COUNT(*) AS totalProducts FROM products",
                    (err, products) => {
                      if (err) return res.status(500).json(err);
                      stats.totalProducts = products[0].totalProducts;

                      // 7. Total Reviews
                      db.query(
                        "SELECT COUNT(*) AS totalReviews FROM reviews",
                        (err, reviews) => {
                          if (err) return res.status(500).json(err);
                          stats.totalReviews = reviews[0].totalReviews;

                          // 8. Pending Reviews
                          db.query(
                            "SELECT COUNT(*) AS pendingReviews FROM reviews WHERE status = 'pending'",
                            (err, pendingReviews) => {
                              if (err) return res.status(500).json(err);
                              stats.pendingReviews =
                                pendingReviews[0].pendingReviews;

                              // FINAL RESPONSE
                              res.json(stats);
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};



// 📊 Revenue Analytics
const getRevenueAnalytics = (req, res) => {
  const analytics = {};

  // 1️⃣ Today's Revenue
  db.query(
    `
    SELECT IFNULL(SUM(total),0) AS todayRevenue
    FROM orders
    WHERE payment_status = 'paid'
      AND DATE(created_at) = CURDATE()
    `,
    (err, today) => {
      if (err) return res.status(500).json(err);
      analytics.todayRevenue = today[0].todayRevenue;

      // 2️⃣ Monthly Revenue (last 30 days)
      db.query(
        `
        SELECT 
          DATE(created_at) AS date,
          SUM(total) AS revenue
        FROM orders
        WHERE payment_status = 'paid'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
        `,
        (err, monthly) => {
          if (err) return res.status(500).json(err);
          analytics.monthlyRevenue = monthly;

          // 3️⃣ Yearly Revenue (group by month)
          db.query(
            `
            SELECT 
              MONTH(created_at) AS month,
              SUM(total) AS revenue
            FROM orders
            WHERE payment_status = 'paid'
              AND YEAR(created_at) = YEAR(CURDATE())
            GROUP BY MONTH(created_at)
            ORDER BY month
            `,
            (err, yearly) => {
              if (err) return res.status(500).json(err);
              analytics.yearlyRevenue = yearly;

              res.json(analytics);
            }
          );
        }
      );
    }
  );
};

// 📊 Sales Report
const getSalesReport = (req, res) => {
  const report = {};

  // 1️⃣ Overall sales summary
  db.query(
    `
    SELECT 
      COUNT(DISTINCT o.id) AS totalOrders,
      SUM(oi.quantity) AS totalItemsSold,
      SUM(o.total) AS totalSales
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.payment_status = 'paid'
    `,
    (err, summary) => {
      if (err) return res.status(500).json(err);

      report.summary = summary[0];

      // 2️⃣ Sales by date
      db.query(
        `
        SELECT 
          DATE(o.created_at) AS date,
          COUNT(DISTINCT o.id) AS orders,
          SUM(oi.quantity) AS itemsSold,
          SUM(o.total) AS sales
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.payment_status = 'paid'
        GROUP BY DATE(o.created_at)
        ORDER BY date DESC
        `,
        (err, byDate) => {
          if (err) return res.status(500).json(err);

          report.salesByDate = byDate;

          // 3️⃣ Sales by product
          db.query(
            `
            SELECT 
              p.id,
              p.name,
              SUM(oi.quantity) AS quantitySold,
              SUM(oi.quantity * oi.price) AS revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.payment_status = 'paid'
            GROUP BY p.id
            ORDER BY revenue DESC
            `,
            (err, byProduct) => {
              if (err) return res.status(500).json(err);

              report.salesByProduct = byProduct;

              res.json(report);
            }
          );
        }
      );
    }
  );
};



// 🔥 Top Selling Products
const getTopSellingProducts = (req, res) => {
  const { limit } = req.query;

  const topLimit = limit ? parseInt(limit) : 10;

  const query = `
    SELECT 
      p.id,
      p.name,
      SUM(oi.quantity) AS totalSold,
      SUM(oi.quantity * oi.price) AS revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.payment_status = 'paid'
    GROUP BY p.id
    ORDER BY totalSold DESC
    LIMIT ?
  `;

  db.query(query, [topLimit], (err, products) => {
    if (err) return res.status(500).json(err);

    res.json({
      total: products.length,
      products
    });
  });
};


// GET top customers
const getTopCustomers = (req, res) => {
  const query = `
    SELECT 
      u.id AS user_id,
      u.name,
      u.email,
      COUNT(o.id) AS total_orders,
      SUM(o.total) AS total_spent
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.payment_status = 'paid'
    GROUP BY u.id
    ORDER BY total_spent DESC
    LIMIT 10
  `;

  db.query(query, (err, customers) => {
    if (err) return res.status(500).json(err);

    res.json({
      total: customers.length,
      customers
    });
  });
};

// GET recent orders
const getRecentOrders = (req, res) => {
  const query = `
    SELECT 
      o.id AS order_id,
      u.name AS customer_name,
      u.email,
      o.total,
      o.status,
      o.payment_status
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.id DESC
    LIMIT 10
  `;

  db.query(query, (err, orders) => {
    if (err) return res.status(500).json(err);

    res.json({
      total: orders.length,
      orders
    });
  });
};

// GET inventory alerts
const getInventoryAlerts = (req, res) => {
  const threshold = req.query.threshold || 10;

  const query = `
    SELECT 
      id,
      name,
      stock
    FROM products
    WHERE stock <= ?
    ORDER BY stock ASC
  `;

  db.query(query, [threshold], (err, products) => {
    if (err) return res.status(500).json(err);

    res.json({
      threshold,
      totalLowStockProducts: products.length,
      products
    });
  });
};

// GET customer report

const getCustomerReport = (req, res) => {
  const sql = `
    SELECT 
      u.id AS user_id,
      u.name,
      u.email,
      COUNT(o.id) AS total_orders,
      IFNULL(SUM(o.total), 0) AS total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY total_spent DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      total_customers: results.length,
      customers: results
    });
  });
}

const exportCustomerReportCSV = (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(o.id) AS total_orders,
      IFNULL(SUM(o.total_amount), 0) AS total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const parser = new Parser();
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("customer_report.csv");
    res.send(csv);
    });
};
const exportCustomerReportPDF = (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(o.id) AS total_orders,
      IFNULL(SUM(o.total_amount), 0) AS total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=customer_report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(18).text("Customer Report", { align: "center" });
    doc.moveDown();

    results.forEach((c) => {
      doc
        .fontSize(12)
        .text(
          `ID: ${c.id} | ${c.name} | ${c.email} | Orders: ${c.total_orders} | Spent: ₹${c.total_spent}`
        );
    });

    doc.end();
  });
};


module.exports = { 
    getDashboardStats,
    getRevenueAnalytics,
     getSalesReport, 
     getTopSellingProducts,
      getTopCustomers, 
      getRecentOrders, 
      getInventoryAlerts,
       getCustomerReport,
        exportCustomerReportCSV, 
        exportCustomerReportPDF
 };
