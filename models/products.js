import express from 'express';
import Product from "../models/products.js"; 


const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
