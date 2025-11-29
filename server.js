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
import connectToDb from "./db/connectToDB.js";

const app = express();

app.use(cors({origin: [process.env.FRONTEND_URL, process.env.FRONTEND_VERCEL_URL], credentials: true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

console.log("Frontend URL:", process.env.FRONTEND_URL);

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/cart", CartRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send(`
    <div style="background-color: white; color: black; height: 100vh; display: flex; justify-content: center; align-items: center; font-size: 30px; font: bold;">
      Backend is working.
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
connectToDb().then(() => {
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
});