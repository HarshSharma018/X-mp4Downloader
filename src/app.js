const express = require('express');
const downloadRoutes = require('./routes/download.routes');

const app = express();
const path = require('path');
const jobRoutes = require('./routes/job.routes');

app.use('/api/jobs', jobRoutes);
app.use('/files', express.static(path.join(__dirname, '../downloads')));

app.use(express.json());

app.use('/api/downloads', downloadRoutes);

module.exports = app;
