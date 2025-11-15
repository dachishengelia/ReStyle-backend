import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    googleId: String,
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, 
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true } 
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
