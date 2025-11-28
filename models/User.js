import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
  avatar: { type: String, default: "/default-avatar.png" },
});

<<<<<<< HEAD
export default mongoose.model("User", UserSchema);
=======
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
>>>>>>> f950db042b7498f64750b261e1b0695cbdf4d749
