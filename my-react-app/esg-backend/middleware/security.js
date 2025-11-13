// Security middleware
const rateLimit = require('express-rate-limit');

// Security headers
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

// Rate limiting
const createRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
  });
};

// Query sanitization
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        req.query[key] = value
          .replace(/[<>]/g, '')
          .substring(0, 1000); // Limit length
      }
    });
  }
  next();
};

module.exports = {
  securityHeaders,
  createRateLimit,
  sanitizeQuery,
};
