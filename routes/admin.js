import express from "express";
import User from "../models/User.js";
import isAuth, { isAdmin } from "../middlewares/isAuth.middleware.js";

const router = express.Router();


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

    const recentUsers = await User.find({}, "username email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({ totalUsers, buyers, sellers, admins, newThisMonth, recentUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
