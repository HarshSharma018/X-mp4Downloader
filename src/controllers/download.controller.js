const { getVideoInfo, downloadVideo } = require('../services/video.service');
const { createRecord } = require('../services/download.record');
const downloadQueue = require('../queues/download.queue');

async function createDownload(req, res) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  if (!/^https?:\/\/(x\.com|twitter\.com)\//.test(url)) {
    return res.status(400).json({ error: 'url must be a valid twitter/x link' });
  }

  try {
    const info = await getVideoInfo(url);
    res.status(200).json(info);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch video info' });
  }
}

async function downloadVideoFile(req, res) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    const { fileName } = await downloadVideo(url);
    res.status(200).json({ downloadUrl: `/files/${fileName}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to download video' });
  }
}

async function startDownloadJob(req, res) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  const job = await downloadQueue.add('download', { url });
  await createRecord(job.id, url);

  res.status(202).json({ jobId: job.id, status: 'queued' });
}

module.exports = { createDownload, downloadVideoFile, startDownloadJob };