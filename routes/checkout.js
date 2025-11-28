import express from "express";
import Stripe from "stripe";
import Product from "../models/Product.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-session", async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,

      line_items: [
        {
          price_data: {
            currency: "gel",
            product_data: {
              name: product.name,
              images: [product.imageUrl],
            },
            unit_amount: product.price * 100,
          },
          quantity: 1,
        },
      ],
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Stripe Error" });
  }
});

export default router;
