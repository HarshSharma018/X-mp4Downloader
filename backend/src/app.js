require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/routes');
const downloadLimiter = require('./middlewares/rateLimit');
const errorHandler = require('./middlewares/errorHandler');
const { DOWNLOADS_DIR } = require('./services/download');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/downloads', downloadLimiter);

app.use('/files', express.static(DOWNLOADS_DIR));
app.use(routes);

app.use(errorHandler);

module.exports = app;