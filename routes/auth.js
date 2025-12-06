import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import connectToDatabase from "../db/connectToDB.js";
import isAuth from "../middlewares/isAuth.middleware.js"; // Add this line

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.patch("/me/username", async (req, res) => {
  const { username, email, password } = req.body;
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });


    if (user.email !== email) return res.status(400).json({ message: "Incorrect email" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    user.username = username;
    await user.save();

    res.json({
      user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    await connectToDatabase();
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, username, email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/log-in", async (req, res) => {
  console.log("Log-in request received:", { headers: req.headers, body: req.body });

  const { email, password } = req.body;
  if (!email || !password) {
    console.error("Missing email or password");
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Log-in successful for user:", email);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Error during log-in:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "none",
    path: "/", // Ensure the cookie is cleared for the entire domain
  });
  return res.status(200).json({ message: "Logged out successfully" });
});

router.post("/google-login", async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ message: "ID token required" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    await connectToDatabase();
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name || email.split("@")[0],
        email,
        googleId,
        avatar: picture,
        role: "buyer",
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user: { id: user._id, username: user.username, email, role: user.role } });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Invalid ID token" });
  }
});

router.get("/me", async (req, res) => {
  const token = req.cookies.token; 
  if (!token) {
    // console.error("No token provided in /auth/me");
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id, "username email role").lean();
    if (!user) {
      // console.error("User not found in /auth/me");
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    // console.error("Error verifying token in /auth/me:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
});

router.patch("/profile", isAuth, async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (username) {
      user.username = username;
    }

    // Update password if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;