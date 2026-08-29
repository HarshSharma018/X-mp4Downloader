const express = require('express');
const { validateUrl } = require('../middlewares/middlewares');
const {
  getMetadata,
  downloadFile,
  startJob,
  checkJobStatus,
  healthCheck,
} = require('../controllers/controllers');

const router = express.Router();

router.post('/api/downloads', validateUrl, getMetadata);
router.post('/api/downloads/file', validateUrl, downloadFile);
router.post('/api/downloads/job', validateUrl, startJob);
router.get('/api/jobs/:id', checkJobStatus);
router.get('/health', healthCheck);

module.exports = router;