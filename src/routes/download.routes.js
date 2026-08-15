const express = require('express');
const router = express.Router();

const { createDownload } = require('../controllers/download.controller');

router.post('/', createDownload);

module.exports = router;
