const pool = require('../config/database');

async function createRecord(jobId, url) {
  await pool.query(
    `INSERT INTO downloads (job_id, url, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (job_id)
     DO UPDATE SET url = EXCLUDED.url, status = EXCLUDED.status, updated_at = NOW()`,
    [jobId, url, 'queued']
  );
}

async function updateRecord(jobId, { status, filePath, errorMessage }) {
  await pool.query(
    `UPDATE downloads
     SET status = $1, file_path = $2, error_message = $3, updated_at = NOW()
     WHERE job_id = $4`,
    [status, filePath || null, errorMessage || null, jobId]
  );
}

async function getRecord(jobId) {
  const result = await pool.query('SELECT * FROM downloads WHERE job_id = $1', [jobId]);
  return result.rows[0] || null;
}

async function getAllRecords() {
  const result = await pool.query('SELECT * FROM downloads ORDER BY created_at DESC LIMIT 50');
  return result.rows;
}

module.exports = { createRecord, updateRecord, getRecord, getAllRecords };