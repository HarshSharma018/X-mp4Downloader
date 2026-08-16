const express = require('express');
const router = express.Router();
const { createDownload, downloadVideoFile, startDownloadJob } = require('../controllers/download.controller');

router.post('/', createDownload);
router.post('/file', downloadVideoFile);
router.post('/job', startDownloadJob);

module.exports = router;