import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  const token = req.cookies.token; // Retrieve token from cookies
  if (!token) {
    console.error("No token provided");
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.role = payload.role;
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};

export const isSeller = (req, res, next) => {
  if (req.role !== "seller") return res.status(403).json({ message: "Forbidden" });
  next();
};

export default isAuth;
