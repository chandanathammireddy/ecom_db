const express = require("express");
const router = express.Router();

const { auth, isAdmin } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/adminController");
const { getRevenueAnalytics } = require("../controllers/adminController");
const { getSalesReport } = require("../controllers/adminController");
const { getTopSellingProducts } = require("../controllers/adminController");
const { getTopCustomers } = require("../controllers/adminController");
const { getRecentOrders } = require("../controllers/adminController");
const { getInventoryAlerts } = require("../controllers/adminController");
const { getCustomerReport } = require("../controllers/adminController");
const {exportCustomerReportCSV} = require("../controllers/adminController");
const {exportCustomerReportPDF} = require("../controllers/adminController");
const {getAllSupportTickets} = require("../controllers/supportController");
const {updateTicketStatus} = require("../controllers/supportController");

// Update support ticket status
router.put("/support-tickets/:id/status", auth, isAdmin, updateTicketStatus);

// ADMIN – Get all support tickets
router.get("/support-tickets", auth, isAdmin, getAllSupportTickets);

// ADMIN DASHBOARD
router.get("/dashboard", auth, isAdmin, getDashboardStats);

// REVENUE ANALYTICS
router.get("/revenue-analytics", auth, isAdmin, getRevenueAnalytics);

router.get("/sales-report", auth, isAdmin, getSalesReport);

router.get("/top-selling-products", auth, isAdmin, getTopSellingProducts);

router.get("/top-customers", auth, isAdmin, getTopCustomers);

router.get("/recent-orders", auth, isAdmin, getRecentOrders);

router.get("/inventory-alerts", auth, isAdmin, getInventoryAlerts);

router.get("/reports/customers",auth,isAdmin,getCustomerReport);

router.get("/reports/customers/csv",auth,isAdmin,exportCustomerReportCSV);

router.get("/reports/customers/pdf",auth,isAdmin,exportCustomerReportPDF);



module.exports = router;
