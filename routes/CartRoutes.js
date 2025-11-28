import express from "express";
import mongoose from "mongoose";
import isAuth from "../middlewares/isAuth.middleware.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get the user's cart
router.get("/", isAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("products.product", "name price");
    if (!cart) {
      return res.status(200).json({ products: [], total: 0 });
    }

    const total = cart.products.reduce((sum, item) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    res.json({ products: cart.products, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
});

// Add a product to the cart
router.post("/", isAuth, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, products: [] });
    }

    const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

    if (productIndex >= 0) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json({ message: "Product added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product to cart", error: err.message });
  }
});

// Update product quantity in the cart
router.patch("/:productId", isAuth, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0" });
  }

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

    if (productIndex >= 0) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      res.json({ message: "Product quantity updated", cart });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to update product quantity", error: err.message });
  }
});

// Remove a product from the cart
router.delete("/:productId", isAuth, async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.json({ message: "Product removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove product from cart", error: err.message });
  }
});

// Clear the entire cart
router.delete("/", isAuth, async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart", error: err.message });
  }
});

export default router;