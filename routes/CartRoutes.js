import express from "express";
import isAuth, { isAdmin } from "../middlewares/isAuth.middleware.js"; 
import Cart from "../models/Cart.js";

const router = express.Router();


router.get("/", isAuth, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const cart = await Cart.findOne({ user: req.userId }).populate("products.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/", isAuth, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  try {
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, products: [] });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    console.error("Error adding product to cart:", err.message);
    res.status(500).json({ message: "Failed to add product to cart" });
  }
});


router.patch("/:productId", isAuth, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be greater than 0" });
  }

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex >= 0) {
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    console.error("Error updating product quantity:", err.message);
    res.status(500).json({ message: "Failed to update product quantity" });
  }
});


router.delete("/:productId", isAuth, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Error removing product from cart:", err.message);
    res.status(500).json({ message: "Failed to remove product from cart" });
  }
});


router.delete("/", isAuth, async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ user: req.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err.message);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

export default router;