const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

exports.handler = serverless(app);