const downloadQueue = require('../queues/download.queue');

async function getJobStatus(req, res) {
  const job = await downloadQueue.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'job not found' });
  }

  const state = await job.getState();

  res.status(200).json({
    jobId: job.id,
    status: state,
    result: job.returnvalue || null,
    failedReason: job.failedReason || null,
  });
}

module.exports = { getJobStatus };
