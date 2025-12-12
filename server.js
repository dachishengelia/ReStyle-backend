import dotenv from "dotenv";
dotenv.config();
import stripeRoutes from "./routes/stripe.js";
import checkoutRoutes from "./routes/checkout.js";

import express from "express";
const app = express();
import productActionsRoutes from "./routes/productActions.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import SellerRoutes from "./routes/seller.js";
import CartRoutes from "./routes/CartRoutes.js";
import productRoutes from "./routes/Product.js";
import connectToDb from "./db/connectToDB.js";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_VERCEL_URL,
  "http://localhost:5173"
];
// app.use(cors({}));
app.use(cors({origin: [process.env.FRONTEND_URL, process.env.FRONTEND_VERCEL_URL], credentials: true}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

console.log("Frontend URL:", process.env.FRONTEND_URL);


app.use("/api/auth", authRoutes);
app.use("/api/product-actions", productActionsRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/stripe", stripeRoutes);

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