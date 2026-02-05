const Admin = require("../models/Admin");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

const getDashboardStats = async (req, res) => {
  const stats = {};
  try {
    // Parallel execution for better performance
    const [users, orders, pending, today, revenue, products, reviews, pendingRev] = await Promise.all([
      Admin.getCounts('users'),
      Admin.getCounts('orders'),
      Admin.getCounts('orders', "status = 'pending'"),
      Admin.getCounts('orders', "DATE(created_at) = CURDATE()"),
      Admin.getRevenue(''),
      Admin.getCounts('products'),
      Admin.getCounts('reviews'),
      Admin.getCounts('reviews', "status = 'pending'")
    ]);

    stats.totalUsers = users[0].count;
    stats.totalOrders = orders[0].count;
    stats.pendingOrders = pending[0].count;
    stats.todaysOrders = today[0].count;
    stats.totalRevenue = revenue[0].revenue;
    stats.totalProducts = products[0].count;
    stats.totalReviews = reviews[0].count;
    stats.pendingReviews = pendingRev[0].count;

    res.json(stats);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 📊 Revenue Analytics
const getRevenueAnalytics = async (req, res) => {
  try {
    const [today, monthly, yearly] = await Promise.all([
      Admin.getRevenue("DATE(created_at) = CURDATE()"),
      Admin.getDailyRevenue(),
      Admin.getMonthlyRevenue()
    ]);

    res.json({
      todayRevenue: today[0].revenue,
      monthlyRevenue: monthly,
      yearlyRevenue: yearly
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// 📊 Sales Report
const getSalesReport = async (req, res) => {
  try {
    const [summary, byDate, byProduct] = await Promise.all([
      Admin.getSalesSummary(),
      Admin.getSalesByDate(),
      Admin.getSalesByProduct()
    ]);

    res.json({
      summary: summary[0],
      salesByDate: byDate,
      salesByProduct: byProduct
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

// 🔥 Top Selling Products
const getTopSellingProducts = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const products = await Admin.getTopSellingProducts(limit);
    res.json({ total: products.length, products });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET top customers
const getTopCustomers = async (req, res) => {
  try {
    const customers = await Admin.getTopCustomers(10);
    res.json({ total: customers.length, customers });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET recent orders
const getRecentOrders = async (req, res) => {
  try {
    const orders = await Admin.getRecentOrders(10);
    res.json({ total: orders.length, orders });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET inventory alerts
const getInventoryAlerts = async (req, res) => {
  try {
    const Product = require("../models/Product");
    const threshold = req.query.threshold || 10;
    const products = await Product.getLowStock(threshold);
    res.json({ threshold, totalLowStockProducts: products.length, products });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET customer report
const getCustomerReport = async (req, res) => {
  try {
    const results = await Admin.getCustomerStats();
    res.json({ total_customers: results.length, customers: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const exportCustomerReportCSV = async (req, res) => {
  try {
    const results = await Admin.getCustomerStats();
    const parser = new Parser();
    const csv = parser.parse(results);
    res.header("Content-Type", "text/csv");
    res.attachment("customer_report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json(err);
  }
};

const exportCustomerReportPDF = async (req, res) => {
  try {
    const results = await Admin.getCustomerStats();
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=customer_report.pdf");
    doc.pipe(res);
    doc.fontSize(18).text("Customer Report", { align: "center" });
    doc.moveDown();
    results.forEach((c) => {
      doc.fontSize(12).text(`ID: ${c.id} | ${c.name} | ${c.email} | Orders: ${c.total_orders} | Spent: ₹${c.total_spent}`);
    });
    doc.end();
  } catch (err) {
    res.status(500).json(err);
  }
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
