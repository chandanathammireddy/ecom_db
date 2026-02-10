const express = require("express");
const app = require("./app");
require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");

app.use("/api/categories", categoryRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const productRoutes = require("./routes/productRoutes");

app.use("/api/products", productRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/categories", require("./routes/categoryRoutes"));

const cartRoutes = require("./routes/cartRoutes");

app.use("/api/cart", cartRoutes);

const wishlistRoutes = require("./routes/wishlistRoutes");

app.use("/api/wishlist", wishlistRoutes);
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/orders", orderRoutes);

const webhookRoutes = require("./routes/webhookRoutes");

app.use(express.json()); // IMPORTANT
app.use("/api/webhook", webhookRoutes);
