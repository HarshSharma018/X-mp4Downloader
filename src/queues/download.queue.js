const { Queue } = require('bullmq');
const connection = require('../config/redis');

const downloadQueue = new Queue('download-queue', { connection });

module.exports = downloadQueue;