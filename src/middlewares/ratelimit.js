const rateLimit = require('express-rate-limit');

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
});

module.exports = downloadLimiter;