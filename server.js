import dotenv from "dotenv";
dotenv.config();
import stripeRoutes from "./routes/stripe.js";

import express from "express";
const app = express();

import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import SellerRoutes from "./routes/seller.js";
import CartRoutes from "./routes/CartRoutes.js";
import productRoutes from "./routes/Product.js";
import connectToDb from "./db/connectToDB.js";

// --- FIXED CORS CONFIG ---


const allowedOrigins = [
  "http://localhost:5173",
  "https://re-style-frontend.vercel.app",
];

// USE ONLY THIS — remove all your old custom middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow Postman, server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

// Preflight for all routes
app.options("*", cors());


// Body + cookies
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

console.log("Frontend URL:", process.env.FRONTEND_URL);

// Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/api/cart", CartRoutes);


app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send(`
    <div style="background-color: white; color: black; height: 100vh; display: flex; justify-content: center; align-items: center; font-size: 30px; font-weight: bold;">
      Backend is working.
    </div>
  `);
});

const PORT = process.env.PORT || 3000;

connectToDb().then(() => {
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
});
