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
import profileRoutes from "./routes/profile.js";

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  process.env.FRONTEND_URL, // Local frontend
  process.env.FRONTEND_VERCEL_URL, // Vercel frontend
  "https://re-style-frontend-bqhiq7l9i-dachi-shengelias-projects.vercel.app", // Additional frontend URL
  "https://re-style-frontend-ndt07jefn-dachi-shengelias-projects.vercel.app", // New frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming request origin:", origin); // Log the origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked: ${origin}`); // Log blocked origins
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true, // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose
  .connect(process.env.NODE_ENV === "production" ? process.env.MONGO_URI_PROD : process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`MongoDB connected in ${process.env.NODE_ENV} mode`))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/cart", CartRoutes);
app.use("/api/products", productRoutes);
app.use("/profile", profileRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));