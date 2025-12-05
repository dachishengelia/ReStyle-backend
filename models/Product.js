import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String }, // For Cloudinary integration
  createdAt: { type: Date, default: Date.now },

  // New fields
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // store user IDs
  comments: [commentSchema],
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
