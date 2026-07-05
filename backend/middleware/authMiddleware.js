const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smarteval_jwt_secret_key_2025";

const authMiddleware = (req, res, next) => {
  console.log('Auth middleware called for path:', req.path);

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('No auth header');
    req.user = null;
    const error = new Error("No token");
    error.status = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  console.log('Token extracted:', token ? 'present' : 'missing');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    req.user = null;
    const error = new Error("Invalid token");
    error.status = 401;
    return next(error);
  }
};

module.exports = authMiddleware;