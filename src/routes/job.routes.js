const express = require('express');
const router = express.Router();
const { getJobStatus } = require('../controllers/job.controller');

router.get('/:id', getJobStatus);

module.exports = router;