import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Rate limiting específico para IA (mais restritivo)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requisições por minuto
  message: {
    error: 'Muitas requisições para análise IA. Tente novamente em 1 minuto.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuração primeiro - ANTES de outros middlewares
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use(limiter);
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
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'production',
    platform: 'netlify',
    database: 'in-memory'
  });
});

// Rota de teste
app.get('/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Netlify Functions API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota básica de auth para teste
app.post('/auth/test', (req: Request, res: Response) => {
  res.json({
    message: 'Auth endpoint funcionando!',
    body: req.body
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Export handler for Netlify Functions
export const handler = serverless(app);