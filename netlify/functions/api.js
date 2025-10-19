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

// ========== AUTH ROUTES ==========
// Register
app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Validação básica
  if (!name || !email || !password) {
    return res.status(400).json({ 
      error: 'Nome, email e senha são obrigatórios' 
    });
  }
  
  // Simular criação de usuário (implementar com banco real depois)
  const user = {
    id: Date.now(),
    name,
    email,
    created_at: new Date().toISOString()
  };
  
  // Simular token JWT (implementar JWT real depois)
  const token = `fake_token_${user.id}_${Date.now()}`;
  
  res.status(201).json({
    message: 'Usuário criado com sucesso',
    user,
    token
  });
});

// Login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email e senha são obrigatórios' 
    });
  }
  
  // Simular autenticação (implementar verificação real depois)
  if (email === 'admin@teste.com' && password === '123456') {
    const user = {
      id: 1,
      name: 'Usuário Demo',
      email: 'admin@teste.com',
      created_at: new Date().toISOString()
    };
    
    const token = `fake_token_${user.id}_${Date.now()}`;
    
    res.json({
      message: 'Login realizado com sucesso',
      user,
      token
    });
  } else {
    res.status(401).json({ 
      error: 'Email ou senha incorretos' 
    });
  }
});

// Me (verificar token)
app.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Simular verificação de token (implementar JWT real depois)
  if (token.startsWith('fake_token_')) {
    const user = {
      id: 1,
      name: 'Usuário Demo',
      email: 'admin@teste.com',
      created_at: new Date().toISOString()
    };
    
    res.json({ user });
  } else {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// ========== TRANSACTIONS ROUTES ==========
// Get transactions
app.get('/transactions', (req, res) => {
  // Simular dados de transações
  const transactions = [
    {
      id: 1,
      description: 'Salário',
      amount: 5000.00,
      type: 'income',
      category: 'Trabalho',
      date: '2025-10-15',
      created_at: '2025-10-15T10:00:00Z'
    },
    {
      id: 2,
      description: 'Supermercado',
      amount: 250.00,
      type: 'expense',
      category: 'Alimentação',
      date: '2025-10-16',
      created_at: '2025-10-16T14:30:00Z'
    },
    {
      id: 3,
      description: 'Combustível',
      amount: 150.00,
      type: 'expense',
      category: 'Transporte',
      date: '2025-10-17',
      created_at: '2025-10-17T08:15:00Z'
    }
  ];
  
  res.json(transactions);
});

// Create transaction
app.post('/transactions', (req, res) => {
  const { description, amount, type, category, date } = req.body;
  
  if (!description || !amount || !type || !category) {
    return res.status(400).json({ 
      error: 'Descrição, valor, tipo e categoria são obrigatórios' 
    });
  }
  
  const transaction = {
    id: Date.now(),
    description,
    amount: parseFloat(amount),
    type,
    category,
    date: date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };
  
  res.status(201).json(transaction);
});

// ========== DASHBOARD ROUTES ==========
// Get summary
app.get('/dashboard/summary', (req, res) => {
  res.json({
    totalIncome: 5000.00,
    totalExpenses: 400.00,
    balance: 4600.00,
    transactionCount: 3,
    lastTransaction: {
      description: 'Combustível',
      amount: 150.00,
      type: 'expense',
      date: '2025-10-17'
    }
  });
});

// ========== AI ROUTES ==========
// AI Analysis
app.post('/ai/analyze', (req, res) => {
  // Simular análise de IA
  const analysis = {
    summary: {
      totalIncome: 5000.00,
      totalExpenses: 400.00,
      balance: 4600.00,
      savingsRate: 92
    },
    categoryBreakdown: [
      { category: 'Alimentação', amount: 250.00, percentage: 62.5 },
      { category: 'Transporte', amount: 150.00, percentage: 37.5 }
    ],
    insights: [
      'Excelente taxa de poupança de 92%!',
      'Seus gastos com alimentação representam 62.5% dos gastos totais.',
      'Considere definir um orçamento para controlar melhor os gastos.'
    ],
    suggestions: [
      'Continue mantendo essa excelente disciplina financeira',
      'Considere investir o dinheiro poupado para fazer ele render',
      'Monitore seus gastos com alimentação para otimizar ainda mais'
    ],
    spendingPattern: 'Conservador - Gasta pouco e economiza muito',
    riskLevel: 'Baixo'
  };
  
  res.json(analysis);
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