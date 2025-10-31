import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  const headers = req.headers["authorization"];
  if (!headers)
    return res.status(401).json({ message: "No permission" });

  const [type, token] = headers.split(" ");
  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    req.role = payload.role;
    next();
  } catch (err) {
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
