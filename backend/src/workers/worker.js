require('dotenv').config();
const { Worker } = require('bullmq');
const fs = require('fs');
const { connection } = require('../queues/queue');
const { downloadVideo } = require('../services/download');
const { updateRecord, cleanupOldRecords } = require('../config/database');
const logger = require('../utils/logger');

async function runCleanup() {
  try {
    const deleted = await cleanupOldRecords(24);
    let filesRemoved = 0;

    for (const row of deleted) {
      if (row.file_path && fs.existsSync(row.file_path)) {
        fs.unlinkSync(row.file_path);
        filesRemoved++;
      }
    }

    if (deleted.length > 0) {
      logger.info(`Cleanup: removed ${deleted.length} old records, ${filesRemoved} files deleted`);
    }
  } catch (err) {
    logger.error('Cleanup job failed:', err.message);
  }
}

const worker = new Worker(
  'download-queue',
  async (job) => {
    const { url } = job.data;
    await updateRecord(job.id, { status: 'processing' });

    const result = await downloadVideo(url);
    await updateRecord(job.id, { status: 'completed', filePath: result.fileName });
    return result;
  },
  { connection, concurrency: 3 }
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on('failed', async (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err.message);
  if (job) {
    await updateRecord(job.id, { status: 'failed', errorMessage: err.message });
  }
});

runCleanup();
setInterval(runCleanup, 60 * 60 * 1000);

logger.info('Download worker started, listening for jobs...');