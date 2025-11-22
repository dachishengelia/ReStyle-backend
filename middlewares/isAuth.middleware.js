import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  const token = req.cookies.token; // Retrieve the token from cookies
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // Validate token
    req.userId = payload.id;
    req.role = payload.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    console.error("Access denied: Admin role required");
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export const isSeller = (req, res, next) => {
  if (req.role !== "seller") {
    console.error("Access denied: Seller role required");
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export default isAuth;