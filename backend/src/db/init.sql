CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  job_id VARCHAR(255) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  file_path TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);