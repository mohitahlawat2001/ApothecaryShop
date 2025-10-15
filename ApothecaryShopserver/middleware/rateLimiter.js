const rateLimit = require("express-rate-limit");
const net = require("net");

function normalizeIp(ip) {
  if (!ip) return "";
  // Some proxies or frameworks might return an array
  if (Array.isArray(ip)) ip = ip[0];
  // Convert non-string (e.g., Buffer, object) to string
  ip = String(ip);

  // Strip IPv4-mapped IPv6 prefix like "::ffff:"
  if (ip.startsWith("::ffff:")) return ip.slice(7);

  return ip;
}
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
    const baseKey = normalizeIp(req.ip);
    if (req && req.body && typeof req.body.email === "string") {
      return `${baseKey}:${req.body.email.trim()}`;
    }
    return baseKey;
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