const express = require('express');
const downloadRoutes = require('./routes/download.routes');

const app = express();

app.use(express.json());

app.use('/api/downloads', downloadRoutes);

module.exports = app;
