const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const token = /^Bearer ([^ ]+)$/i.exec(authHeader || "")?.[1];

  if (!token) {
    return res.status(401).json({
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const role = decoded.role?.toLowerCase();

    if (!["employee", "admin"].includes(role) || !decoded.user_id) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    req.user = {
      ...decoded,
      role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;
