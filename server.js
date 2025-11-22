import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.js"; 
import adminRoutes from "./routes/admin.js";
import SellerRoutes from "./routes/seller.js";
import CartRoutes from "./routes/CartRoutes.js";
import productRoutes from "./routes/Product.js";

const app = express();

// --- FIX 1: Allow local + production frontend
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  process.env.FRONTEND_VERCEL_URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked: " + origin));
    },
    credentials: true, // REQUIRED for cookies
  })
);

// Order is correct
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

// Check env loaded
console.log("Allowed origins:", allowedOrigins);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/cart", CartRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// --- FIX 4: DO NOT have a second logout route here.
// Logout already exists in /auth/logout
// REMOVE this duplicate route.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
