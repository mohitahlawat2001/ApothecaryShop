const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  message: {
    success: false,
    message: "Too many accounts created from this IP, please try again later",
  },
  handler: (req, res) => {
    const retrySeconds = Math.ceil(60 * 60);
    res.set("Retry-After", String(retrySeconds));
    res.status(429).json({
      success: false,
      message:
        "Too many accounts created from this IP, please try again after an hour",
    });
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    if (req && req.body && req.body.email === "string") {
      return `${req.ip}:${req.body.email.trim()}`;
    }
    return req.ip;
  },
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  handler: (req, res /*, next */) => {
    const retrySeconds = Math.ceil(15 * 60);
    res.set("Retry-After", String(retrySeconds));
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again after 15 minutes",
    });
  },
});

module.exports = { registerLimiter, loginLimiter};