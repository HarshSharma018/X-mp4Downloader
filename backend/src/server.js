const app = require('./app');
const { initSchema } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function start() {
  await initSchema();
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err.message);
  process.exit(1);
});