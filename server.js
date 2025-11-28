import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import profileRoutes from "./routes/profile.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import SellerRoutes from "./routes/seller.js";
import CartRoutes from "./routes/CartRoutes.js";
import productRoutes from "./routes/Product.js";

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,         // localhost
  process.env.FRONTEND_VERCEL_URL   // Vercel frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

console.log("Frontend URL:", process.env.FRONTEND_URL);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/cart", CartRoutes);
app.use("/products", productRoutes);
app.use("/profile", profileRoutes);
app.get("/", (req, res) => {
  res.send(`
    <div style="background-color: black; color: lime; height: 100vh; display: flex; justify-content: center; align-items: center; font-size: 24px;">
      ✅ Backend is working!
    </div>
  `);
});

app.post("/logout", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // <-- must be "none" for cross-site cookies
    })
    .json({ message: "Logged out successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
