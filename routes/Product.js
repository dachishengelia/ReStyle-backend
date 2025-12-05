import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import isAuth, { isSeller, isAdmin } from "../middlewares/isAuth.middleware.js";
import { upload } from "../config/cloudinary.config.js";

const router = express.Router();

// --- Get all products ---
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("sellerId", "username email").lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// --- Get product by ID ---
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const product = await Product.findById(id).populate("sellerId", "username email");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Get products for seller ---
router.get("/seller", isAuth, isSeller, async (req, res) => {
  try {
    const sellerId = req.userId;
    const products = await Product.find({ sellerId }).lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Add new product ---
router.post("/", isAuth, isSeller, async (req, res) => {
  const { name, price, description, category } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({ message: "Name, price, and description are required." });
  }

  try {
    const product = new Product({
      name,
      price,
      description,
      category,
      sellerId: req.userId,
      imageUrl: null,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product" });
  }
});

// --- Upload product image ---
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = req.file.path; // Cloudinary URL
    res.status(200).json({ message: "Image uploaded successfully", imageUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload image", error: err.message });
  }
});

// --- Delete product (seller) ---
router.delete("/:id", isAuth, isSeller, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.userId,
    });

    if (!product) return res.status(404).json({ message: "Product not found or unauthorized" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// --- Delete product (admin) ---
router.delete("/admin/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(productId);
    res.json({ message: "Product deleted successfully by admin" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// --- Toggle like (per user) ---
router.post("/:id/like", isAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const userId = req.user._id; // assuming isAuth sets req.user
    const index = product.likes.indexOf(userId);

    if (index === -1) {
      product.likes.push(userId);
    } else {
      product.likes.splice(index, 1);
    }

    await product.save();
    res.json({ likes: product.likes.length, liked: index === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Add comment ---
router.post("/:id/comment", isAuth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Comment text required" });

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const comment = {
      userId: req.user._id,
      username: req.user.username,
      text,
      createdAt: new Date(),
    };

    product.comments.push(comment);
    await product.save();

    res.json({ comments: product.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
