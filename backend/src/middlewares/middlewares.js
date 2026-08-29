const { z } = require('zod');
const rateLimit = require('express-rate-limit');

const logger = require('../utils/logger');

//url validation

const urlSchema = z.object({
  url: z

    .string({ required_error: 'url is required' })
    .url({ message: 'url must be a valid URL' })
    .regex(/^https?:\/\/(x\.com|twitter\.com)\//, {
      message: 'url must be a valid twitter/x link',
    }),
});

function validateUrl(req, res, next) {
  const result = urlSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors[0].message });
  }
  req.validatedUrl = result.data.url;

  next();
}

//rate limiting

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
});

//error handling 

function errorHandler(err, req, res, next) {

  logger.error(err.stack);

  res.status(500).json({ error: 'Something went wrong on our end' });
}

module.exports = { validateUrl, downloadLimiter, errorHandler };