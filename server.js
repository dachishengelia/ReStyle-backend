import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
<<<<<<< HEAD
import profileRoutes from "./routes/profile.js";
import authRoutes from "./routes/auth.js";
=======

import authRoutes from "./routes/auth.js"; 
>>>>>>> f950db042b7498f64750b261e1b0695cbdf4d749
import adminRoutes from "./routes/admin.js";
import SellerRoutes from "./routes/seller.js";
import CartRoutes from "./routes/CartRoutes.js";
import productRoutes from "./routes/Product.js";

const app = express();

<<<<<<< HEAD
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
=======
const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_VERCEL_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
    allowedHeaders: ["Content-Type", "Authorization"], 
  })
);
app.use(express.json())
app.use(express.static("public"))
app.use(cookieParser())
>>>>>>> f950db042b7498f64750b261e1b0695cbdf4d749

console.log("Frontend URL:", process.env.FRONTEND_URL);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/cart", CartRoutes);
<<<<<<< HEAD
app.use("/products", productRoutes);
app.use("/profile", profileRoutes);
=======
app.use("/api/products", productRoutes);

>>>>>>> f950db042b7498f64750b261e1b0695cbdf4d749
app.get("/", (req, res) => {
  res.send(`
    <div style="background-color: black; color: lime; height: 100vh; display: flex; justify-content: center; align-items: center; font-size: 24px;">
      ✅ Backend is working locally!
    </div>
  `);
});

app.post("/logout", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .json({ message: "Logged out successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));