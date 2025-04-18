import jwt from "jsonwebtoken";

// Middleware to verify token sent in the request header.
// If the token is valid, sets the `req.user` property to the decoded token object.
// If the token is invalid or missing, returns an error response.

export const verifyToken = async (req, res, next) => {
  try {
    console.log('🔒 Auth Middleware - Checking token');
    console.log('Request path:', req.originalUrl);
    let token = req.header("Authorization");

    if (!token) {
      console.log('❌ No Authorization header found');
      return res.status(403).json({ message: "Access Denied - No token provided" });
    }

    console.log('Token format:', token.substring(0, 15) + '...');

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
      console.log('Bearer token extracted');
    } else {
      console.log('⚠️ Token doesn\'t start with "Bearer "');
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified successfully for user:', verified.id);
      req.user = verified;
      next();
    } catch (verifyError) {
      console.log('❌ Token verification failed:', verifyError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (err) {
    console.error('❌ Auth middleware error:', err);
    res.status(500).json({ message: "Authentication error", error: err.message });
  }
};