// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import mongoose from "mongoose";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import checkoutRoutes from "./routes/checkout.js";
// import authRoutes from "./routes/auth.js";
// import adminRoutes from "./routes/admin.js";
// import SellerRoutes from "./routes/seller.js";
// import CartRoutes from "./routes/CartRoutes.js";
// import productRoutes from "./routes/Product.js";

// const app = express();

// const allowedOrigins = [
//   process.env.FRONTEND_URL,         
//   process.env.FRONTEND_VERCEL_URL,  
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("CORS blocked: " + origin));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
//     allowedHeaders: ["Content-Type", "Authorization"], 
//   })
// );

// app.options("*", cors()); 

// app.use(express.json());
// app.use(express.static("public"));


// console.log("Frontend URL:", process.env.FRONTEND_URL);

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// app.use("/auth", authRoutes);
// app.use("/admin", adminRoutes);
// app.use("/seller", SellerRoutes);
// app.use("/cart", CartRoutes);
// app.use("/api/products", productRoutes);
// app.use("/checkout", checkoutRoutes);


// app.get("/", (req, res) => {
//   res.send(`
//     <div style="background-color: black; color: lime; height: 100vh; display: flex; justify-content: center; align-items: center; font-size: 24px;">
//       ✅ Backend is working locally!
//     </div>
//   `);
// });

// app.post("/logout", (req, res) => {
//   res
//     .clearCookie("token", {
//       httpOnly: true,
//       secure: false,
//       sameSite: "lax",
//     })
//     .json({ message: "Logged out successfully" });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));



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

const allowedOrigins = [process.env.FRONTEND_URL, "https://re-style-frontend.vercel.app"];


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

console.log("Frontend URL:", process.env.FRONTEND_URL);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", SellerRoutes);
app.use("/cart", CartRoutes);
app.use("/api/products", productRoutes);

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