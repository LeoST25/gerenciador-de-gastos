const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const serverless = require('serverless-http');

const app = express();

// CORS configuração primeiro - ANTES de outros middlewares
app.use((req, res, next) => {
  // Permitir todas as origens
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas
  
  // Responder a requisições OPTIONS imediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// CORS usando biblioteca (como fallback)
app.use(cors({
  origin: true, // Permitir qualquer origem
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    platform: 'netlify',
    database: 'in-memory'
  });
});

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Netlify Functions API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota básica de auth para teste
app.post('/auth/test', (req, res) => {
  res.json({
    message: 'Auth endpoint funcionando!',
    body: req.body
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Export handler for Netlify Functions
exports.handler = serverless(app, {
  basePath: '/api'
});