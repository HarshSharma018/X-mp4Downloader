require('dotenv').config();
const { Queue } = require('bullmq');
const { Redis } = require('ioredis');
const { createRecord } = require('../config/database');
const logger = require('../utils/logger');

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const downloadQueue = new Queue('download-queue', { connection });

async function enqueueDownload(url) {
  const job = await downloadQueue.add(
    'download',
    { url },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    }
  );
  await createRecord(job.id, url);
  logger.info(`Job ${job.id} queued for ${url}`);
  return job.id;
}

async function getJobStatus(jobId) {
  const job = await downloadQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  return {
    jobId: job.id,
    status: state,
    result: job.returnvalue || null,
    failedReason: job.failedReason || null,
  };
}

module.exports = { downloadQueue, connection, enqueueDownload, getJobStatus };