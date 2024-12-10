const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (roles) => (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (roles && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: "Access Denied. Insufficient permissions." });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }
};


module.exports = authMiddleware;