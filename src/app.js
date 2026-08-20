require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');

const downloadRoutes = require('./routes/download.routes');
const jobRoutes = require('./routes/job.routes');
const downloadLimiter = require('./middlewares/rateLimit.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(express.json());

app.use('/api/downloads', downloadLimiter, downloadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/files', express.static(path.join(__dirname, '../downloads')));

app.use(errorHandler);

module.exports = app;