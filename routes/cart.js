import express from "express";
import isAuth, { isSeller, isAdmin } from "../middlewares/isAuth.middleware.js"; // <- fixed import


const router = express.Router();


router.get("/", isAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("products.product");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/", isAuth, async (req, res) => {

});

export default router;
