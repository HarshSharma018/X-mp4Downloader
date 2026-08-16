const { getJob } = require('../services/job.store');

function getJobStatus(req, res) {
  const job = getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'job not found' });
  }

  res.status(200).json(job);
}

module.exports = { getJobStatus };
