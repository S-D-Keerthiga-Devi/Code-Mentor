import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // ⏱️ 1-minute window
  limit: 5, // 🚫 Limit each IP to 5 requests per minute
  standardHeaders: true, // ✅ Sends rate limit info in response headers
  legacyHeaders: false, // 🚫 Disables deprecated 'X-RateLimit-*' headers

  // Custom handler when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "⏳ Too many requests. Please wait a minute before retrying.",
    });
  },
});

export default rateLimiter;
