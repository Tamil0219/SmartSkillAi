const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "3a025059ba0750fd3ef087bce795e9cdb8f3e23cc860a4f9282aea7a5f4370831ff67a590f9a7e799b6630386057db06cdf0468ec761b3f0ef69a93d6108fac0";

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