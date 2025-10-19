const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const serverless = require('serverless-http');
const db = require('./database');

const app = express();

// Inicializar banco de dados
db.initializeTables().catch(console.error);

// Função para extrair ID do usuário do token fake
const getUserIdFromToken = (token) => {
  if (!token || !token.startsWith('fake_token_')) {
    return null;
  }
  const parts = token.split('_');
  return parts.length >= 3 ? parseInt(parts[2]) : null;
};

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
    database: 'in-memory',
    stats: {
      totalUsers: users.length,
      totalTransactions: transactions.length
    }
  });
});

// Debug: Listar usuários (apenas para desenvolvimento)
app.get('/debug/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({
    users: usersWithoutPasswords,
    totalUsers: users.length,
    totalTransactions: transactions.length
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
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    // Verificar se email já existe
    const { data: existingUser } = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email já está cadastrado'
      });
    }
    
    // Criar novo usuário
    const { data: user, error } = await db.createUser({
      name,
      email,
      password // Em produção, hash a senha
    });
    
    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
    
    console.log('👤 Usuário criado:', { id: user.id, email: user.email });
    
    // Gerar token
    const token = `fake_token_${user.id}_${Date.now()}`;
    
    // Retornar dados sem senha
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    // Buscar usuário
    const { data: user, error } = await db.findUserByEmail(email);
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }
    
    // Verificar senha (em produção, usar hash)
    if (user.password !== password) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }
    
    console.log('🔐 Login realizado:', { id: user.id, email: user.email });
    
    // Gerar token
    const token = `fake_token_${user.id}_${Date.now()}`;
    
    // Retornar dados sem senha
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Me (verificar token)
app.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    const { data: user, error } = await db.findUserById(userId);
    if (error || !user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    // Retornar dados sem senha
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== TRANSACTIONS ROUTES ==========
// Middleware para verificar autenticação
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Token não fornecido' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
    }
    
    const { data: user, error } = await db.findUserById(userId);
    if (error || !user) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
};

// Get transactions
app.get('/transactions', requireAuth, async (req, res) => {
  try {
    const { data: userTransactions, error } = await db.getUserTransactions(req.user.id);
    
    if (error) {
      console.error('Erro ao buscar transações:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar transações'
      });
    }
    
    res.json({
      success: true,
      data: userTransactions
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Get transactions summary
app.get('/transactions/summary', requireAuth, async (req, res) => {
  try {
    const { data: userTransactions, error } = await db.getUserTransactions(req.user.id);
    
    if (error) {
      console.error('Erro ao buscar transações para resumo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar resumo'
      });
    }
    
    const totalIncome = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
    const totalExpense = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const summary = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: userTransactions.length
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Erro ao calcular resumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Get transactions categories
app.get('/transactions/categories', requireAuth, (req, res) => {
  const categories = [
    'Alimentação',
    'Transporte',
    'Trabalho',
    'Lazer',
    'Saúde',
    'Educação',
    'Casa',
    'Roupas',
    'Investimentos',
    'Outros'
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// Create transaction
app.post('/transactions', requireAuth, async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    
    // Validação detalhada
    const validationErrors = [];
    
    // Description é opcional, mas se fornecida não pode ser vazia
    if (description && description.trim() === '') {
      validationErrors.push('Descrição não pode ser vazia');
    }
    
    if (!amount && amount !== 0) {
      validationErrors.push('Valor é obrigatório');
    } else if (isNaN(parseFloat(amount))) {
      validationErrors.push('Valor deve ser um número válido');
    } else if (parseFloat(amount) <= 0) {
      validationErrors.push('Valor deve ser maior que zero');
    }
    
    if (!type || (type !== 'income' && type !== 'expense')) {
      validationErrors.push('Tipo deve ser "income" ou "expense"');
    }
    
    if (!category || category.trim() === '') {
      validationErrors.push('Categoria é obrigatória');
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: validationErrors.join(', ')
      });
    }
    
    const transactionData = {
      user_id: req.user.id,
      description: description ? description.trim() : null,
      amount: parseFloat(amount),
      type,
      category: category.trim(),
      date: date || new Date().toISOString().split('T')[0]
    };
    
    const { data: transaction, error } = await db.createTransaction(transactionData);
    
    if (error) {
      console.error('Erro ao criar transação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar transação'
      });
    }
    
    console.log('💳 Transação criada com sucesso:', { 
      id: transaction.id, 
      userId: transaction.user_id || transaction.userId, 
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category
    });
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ========== DASHBOARD ROUTES ==========
// Get summary
app.get('/dashboard/summary', requireAuth, async (req, res) => {
  try {
    const { data: userTransactions, error } = await db.getTransactionsByUserId(req.user.id);
    
    if (error) {
      console.error('Erro ao buscar transações para dashboard:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados do dashboard'
      });
    }
    
    const totalIncome = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const sortedTransactions = userTransactions.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    const lastTransaction = sortedTransactions[0] || null;
    
    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: userTransactions.length,
      lastTransaction: lastTransaction ? {
        description: lastTransaction.description,
        amount: lastTransaction.amount,
        type: lastTransaction.type,
        date: lastTransaction.date
      } : null
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ========== AI ROUTES ==========
// AI Analysis
app.post('/ai/analyze', requireAuth, async (req, res) => {
  try {
    const { data: userTransactions, error } = await db.getTransactionsByUserId(req.user.id);
    
    if (error) {
      console.error('Erro ao buscar transações para análise AI:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados para análise'
      });
    }
    
    if (userTransactions.length === 0) {
      return res.json({
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          savingsRate: 0
        },
        categoryBreakdown: [],
        insights: [
          'Você ainda não possui transações registradas.',
          'Comece adicionando suas receitas e despesas para obter insights personalizados.',
          'O controle financeiro é o primeiro passo para alcançar seus objetivos!'
        ],
        suggestions: [
          'Registre sua primeira transação para começar',
          'Defina categorias para organizar melhor seus gastos',
          'Estabeleça metas financeiras mensais'
        ],
        spendingPattern: 'Iniciante - Sem dados suficientes',
        riskLevel: 'Neutro'
      });
    }
  
  const totalIncome = userTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = userTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
  
  // Análise por categoria
  const categoryBreakdown = {};
  userTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });
  
  const categoryArray = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
  
  // Gerar insights
  const insights = [];
  const suggestions = [];
  
  if (savingsRate >= 80) {
    insights.push(`Excelente taxa de poupança de ${savingsRate.toFixed(1)}%!`);
    suggestions.push('Continue mantendo essa excelente disciplina financeira');
    suggestions.push('Considere investir o dinheiro poupado para fazer ele render');
  } else if (savingsRate >= 50) {
    insights.push(`Boa taxa de poupança de ${savingsRate.toFixed(1)}%!`);
    suggestions.push('Mantenha o foco no controle de gastos');
    suggestions.push('Procure oportunidades de investimento para seu dinheiro poupado');
  } else if (savingsRate >= 20) {
    insights.push(`Taxa de poupança moderada de ${savingsRate.toFixed(1)}%.`);
    suggestions.push('Tente identificar gastos que podem ser reduzidos');
    suggestions.push('Considere estabelecer metas de economia mais ambiciosas');
  } else if (savingsRate > 0) {
    insights.push(`Taxa de poupança baixa de ${savingsRate.toFixed(1)}%.`);
    suggestions.push('Revise seus gastos e identifique onde pode economizar');
    suggestions.push('Estabeleça um orçamento mensal para controlar melhor os gastos');
  } else {
    insights.push('Seus gastos estão superiores à sua renda.');
    suggestions.push('URGENTE: Revise todos os seus gastos e corte supérfluos');
    suggestions.push('Busque formas de aumentar sua renda');
  }
  
  if (categoryArray.length > 0) {
    const topCategory = categoryArray[0];
    insights.push(`Seus gastos com ${topCategory.category} representam ${topCategory.percentage.toFixed(1)}% dos gastos totais.`);
    suggestions.push(`Monitore seus gastos com ${topCategory.category} para otimizar ainda mais`);
  }
  
  // Determinar padrão de gastos
  let spendingPattern;
  let riskLevel;
  
  if (savingsRate >= 70) {
    spendingPattern = 'Conservador - Gasta pouco e economiza muito';
    riskLevel = 'Baixo';
  } else if (savingsRate >= 40) {
    spendingPattern = 'Equilibrado - Boa relação entre gastos e poupança';
    riskLevel = 'Baixo';
  } else if (savingsRate >= 10) {
    spendingPattern = 'Moderado - Gasta a maior parte da renda';
    riskLevel = 'Médio';
  } else {
    spendingPattern = 'Alto risco - Gastos próximos ou superiores à renda';
    riskLevel = 'Alto';
  }
  
    const analysis = {
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate: Math.round(savingsRate)
      },
      categoryBreakdown: categoryArray,
      insights,
      suggestions,
      spendingPattern,
      riskLevel
    };
    
    res.json(analysis);
  } catch (error) {
    console.error('Erro na análise de IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
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