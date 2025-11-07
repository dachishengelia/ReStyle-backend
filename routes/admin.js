import express from "express";
import User from "../models/User.js";
import Product from "../models/Product.js"; // Corrected import
import isAuth, { isAdmin } from "../middlewares/isAuth.middleware.js";

const router = express.Router();

router.get("/stats", isAuth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: "buyer" });
    const sellers = await User.countDocuments({ role: "seller" });
    const admins = await User.countDocuments({ role: "admin" });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    res.json({ totalUsers, buyers, sellers, admins, newThisMonth });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

router.get("/users", isAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username email role createdAt").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/users/:id/role", isAuth, isAdmin, async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/users/:id", isAuth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to add a product
router.post('/products', async (req, res) => {
  try {
    const { name, price, description, category, sellerId } = req.body;

    const product = new Product({
      name,
      price,
      description,
      category,
      sellerId,
    });

    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Route to add a product to the cart
router.post('/cart', isAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItem = user.cart.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    res.status(200).json({ message: 'Product added to cart', cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

export default router;
