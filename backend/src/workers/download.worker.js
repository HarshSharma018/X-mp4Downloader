const { Worker } = require('bullmq');
const connection = require('../config/redis');
const { downloadVideo } = require('../services/video.service');
const { updateRecord } = require('../services/download.record');

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
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', async (job, err) => {
  await updateRecord(job.id, { status: 'failed', errorMessage: err.message });
  console.error(`Job ${job.id} failed:`, err.message);
});

console.log('Download worker started, listening for jobs...');