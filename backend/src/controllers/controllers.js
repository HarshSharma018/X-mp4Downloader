const { getVideoInfo, downloadVideo } = require('../services/download');
const { enqueueDownload, getJobStatus } = require('../queues/queue');
const { getRecord } = require('../config/database');
const logger = require('../utils/logger');

async function getMetadata(req, res) {
  try {
    const info = await getVideoInfo(req.validatedUrl);
    res.status(200).json(info);
  } catch (err) {
    logger.error('getVideoInfo failed:', err.message);
    res.status(500).json({ error: 'failed to fetch video info' });
  }
}

async function downloadFile(req, res) {
  try {
    const { fileName } = await downloadVideo(req.validatedUrl);
    res.status(200).json({ downloadUrl: `/files/${fileName}` });
  } catch (err) {
    logger.error('downloadVideo failed:', err.message);
    res.status(500).json({ error: 'failed to download video' });
  }
}

async function startJob(req, res) {
  try {
    const jobId = await enqueueDownload(req.validatedUrl);
    res.status(202).json({ jobId, status: 'queued' });
  } catch (err) {
    logger.error('enqueueDownload failed:', err.message);
    res.status(500).json({ error: 'failed to queue download' });
  }
}

async function checkJobStatus(req, res) {
  try {
    const status = await getJobStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ error: 'job not found' });
    }

    if (status.status === 'completed') {
      const record = await getRecord(req.params.id);
      if (record && record.status === 'failed') {
        return res.status(200).json({
          jobId: status.jobId,
          status: 'failed',
          failedReason: record.error_message,
        });
      }
    }

    res.status(200).json(status);
  } catch (err) {
    logger.error('getJobStatus failed:', err.message);
    res.status(500).json({ error: 'failed to fetch job status' });
  }
}

function healthCheck(req, res) {
  res.status(200).json({ status: 'ok' });
}

module.exports = { getMetadata, downloadFile, startJob, checkJobStatus, healthCheck };