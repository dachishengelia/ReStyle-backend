import express from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import isAuth, { isSeller, isAdmin } from "../middlewares/isAuth.middleware.js";
import { upload } from "../config/cloudinary.config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("sellerId", "username email").lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const product = await Product.findById(id).populate("sellerId", "username email");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get products for the authenticated seller
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
      imageUrl: null, // Commented out cloudinary image handling
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product" });
  }
});

// Endpoint to handle image uploads
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = req.file.path; // Cloudinary URL
    res.status(200).json({ message: "Image uploaded successfully", imageUrl });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload image", error: err.message });
  }
});

// DELETE route for sellers to delete their own products
router.delete("/:id", isAuth, isSeller, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.userId, // Ensure the product belongs to the seller
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// DELETE route for admins to delete any product
router.delete("/admin/:id", isAuth, isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(productId);
    res.json({ message: "Product deleted successfully by admin" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
