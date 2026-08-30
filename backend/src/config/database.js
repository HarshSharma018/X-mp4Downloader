require('dotenv').config();
const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  logger.error('Unexpected Postgres error:', err.message);
});


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

async function getAllRecords(limit = 50) {
  const result = await pool.query(
    'SELECT * FROM downloads ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows;
}

async function cleanupOldRecords(olderThanHours = 24) {
  const result = await pool.query(
    `DELETE FROM downloads WHERE created_at < NOW() - INTERVAL '${olderThanHours} hours' RETURNING file_path`
  );
  return result.rows;
}

async function initSchema() {

  await pool.query( `

    CREATE TABLE IF NOT EXISTS downloads (
      id SERIAL PRIMARY KEY,
      job_id  VARCHAR(255) UNIQUE NOT NULL,
      url TEXT  NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'queued',
      file_path TEXT,
      error_message TEXT,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  logger.info('Database schema ready');
}


module.exports = {
  pool,
  initSchema,
  createRecord,
  updateRecord,
  getRecord,
  getAllRecords,
  cleanupOldRecords,
};