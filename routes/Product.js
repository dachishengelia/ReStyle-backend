import express from "express";
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

router.post("/", isAuth, isSeller, upload.single("image"), async (req, res) => {
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
      imageUrl: req.file ? req.file.path : null,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product" });
  }
});

router.delete("/:id", isAuth, isSeller, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.userId,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

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
