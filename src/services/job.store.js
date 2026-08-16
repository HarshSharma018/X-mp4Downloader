const jobs = new Map();
let counter = 0;

function createJob() {
  const id = String(++counter);
  jobs.set(id, { id, status: 'queued', result: null, error: null });
  return id;
}

function updateJob(id, updates) {
  const job = jobs.get(id);
  Object.assign(job, updates);
}

function getJob(id) {
  return jobs.get(id);
}

module.exports = { createJob, updateJob, getJob };
