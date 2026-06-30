const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const productRouter = require("./router/productRouter");
const cartRouter = require("./router/cartRouter");
const translateRoutes = require("./router/translateRoutes");
const authRouter = require("./router/Authrouter");
const contactRouter = require("./router/contactRouter");
const checkoutRoutes = require("./router/checkoutRoutes");
const blogRoutes = require("./router/blogRoutes");
const subscriberRouter = require("./router/subscriberRouter");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://barosche.com",
        "https://www.barosche.com",
        "http://localhost:3000",
        "http://localhost:3001",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("uploads folder created");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/translate", translateRoutes);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);
app.use("/api", checkoutRoutes);
app.use("/api", blogRoutes);
app.use("/api/subscribe", subscriberRouter);

// Root
app.get("/", (req, res) => {
  res.json({ success: true, message: "Jewellery API is running 💎" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/jewellery_db";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" MongoDB Connected successfully!");
    console.log(`💳 Stripe Payment: http://localhost:${PORT}/api/payment`);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });