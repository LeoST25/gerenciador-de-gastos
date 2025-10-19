// Simulação de banco de dados em memória
let users = [];
let transactions = [];
let nextUserId = 1;
let nextTransactionId = 1;

// Helper para gerar token fake
const generateToken = (userId) => `fake_token_${userId}_${Date.now()}`;

// Helper para extrair ID do token
const getUserIdFromToken = (token) => {
  if (!token || !token.startsWith('fake_token_')) return null;
  const parts = token.split('_');
  return parts.length >= 3 ? parseInt(parts[2]) : null;
};

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

// Handler principal
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/api', '') || '/';
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const headers = event.headers || {};

    console.log(`🔍 ${method} ${path}`, { body, headers: Object.keys(headers) });

    // Middleware de autenticação
    const requireAuth = () => {
      const authHeader = headers.authorization || headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
      }
      const token = authHeader.substring(7);
      const userId = getUserIdFromToken(token);
      if (!userId) {
        throw new Error('Token inválido');
      }
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      return user;
    };

    // Health check
    if (path === '/health') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'OK',
          message: 'API funcionando!',
          timestamp: new Date().toISOString(),
          users: users.length,
          transactions: transactions.length
        })
      };
    }

    // Register
    if (path === '/auth/register' && method === 'POST') {
      const { username, email, password } = body;

      if (!username || !email || !password) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: 'Todos os campos são obrigatórios'
          })
        };
      }

      // Verificar se usuário já existe
      const existingUser = users.find(u => u.email === email || u.username === username);
      if (existingUser) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: 'Usuário já existe'
          })
        };
      }

      const user = {
        id: nextUserId++,
        username,
        email,
        password, // Em produção, fazer hash
        created_at: new Date().toISOString()
      };

      users.push(user);
      const token = generateToken(user.id);

      console.log('👤 Usuário registrado:', { id: user.id, username, email, totalUsers: users.length });

      return {
        statusCode: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          data: {
            user: { id: user.id, username: user.username, email: user.email },
            token
          }
        })
      };
    }

    // Login
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = body;

      if (!email || !password) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: 'Email e senha são obrigatórios'
          })
        };
      }

      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: 'Credenciais inválidas'
          })
        };
      }

      const token = generateToken(user.id);

      console.log('🔑 Login realizado:', { userId: user.id, email });

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          data: {
            user: { id: user.id, username: user.username, email: user.email },
            token
          }
        })
      };
    }

    // Get current user
    if (path === '/auth/me' && method === 'GET') {
      try {
        const user = requireAuth();
        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: true,
            data: {
              user: { id: user.id, username: user.username, email: user.email }
            }
          })
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: error.message
          })
        };
      }
    }

    // Get transactions
    if (path === '/transactions' && method === 'GET') {
      try {
        const user = requireAuth();
        const userTransactions = transactions.filter(t => t.userId === user.id);
        
        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: true,
            data: userTransactions
          })
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: error.message
          })
        };
      }
    }

    // Create transaction
    if (path === '/transactions' && method === 'POST') {
      try {
        const user = requireAuth();
        const { description, amount, type, category, date } = body;

        if (!amount || !type || !category) {
          return {
            statusCode: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            body: JSON.stringify({
              success: false,
              error: 'Valor, tipo e categoria são obrigatórios'
            })
          };
        }

        const transaction = {
          id: nextTransactionId++,
          userId: user.id,
          description: description || null,
          amount: parseFloat(amount),
          type,
          category,
          date: date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        };

        transactions.push(transaction);

        console.log('💳 Transação criada:', { 
          id: transaction.id, 
          userId: transaction.userId, 
          amount: transaction.amount,
          type: transaction.type 
        });

        return {
          statusCode: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: true,
            data: transaction
          })
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: error.message
          })
        };
      }
    }

    // Dashboard summary
    if (path === '/dashboard/summary' && method === 'GET') {
      try {
        const user = requireAuth();
        const userTransactions = transactions.filter(t => t.userId === user.id);
        
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

        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
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
          })
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: error.message
          })
        };
      }
    }

    // AI Analysis
    if (path === '/ai/analyze' && method === 'POST') {
      try {
        const user = requireAuth();
        const userTransactions = transactions.filter(t => t.userId === user.id);

        if (userTransactions.length === 0) {
          return {
            statusCode: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            body: JSON.stringify({
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
            })
          };
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
        } else if (savingsRate >= 50) {
          insights.push(`Boa taxa de poupança de ${savingsRate.toFixed(1)}%!`);
          suggestions.push('Mantenha o foco no controle de gastos');
        } else if (savingsRate >= 20) {
          insights.push(`Taxa de poupança moderada de ${savingsRate.toFixed(1)}%.`);
          suggestions.push('Tente identificar gastos que podem ser reduzidos');
        } else if (savingsRate > 0) {
          insights.push(`Taxa de poupança baixa de ${savingsRate.toFixed(1)}%.`);
          suggestions.push('Revise seus gastos e identifique onde pode economizar');
        } else {
          insights.push('Seus gastos estão superiores à sua renda.');
          suggestions.push('URGENTE: Revise todos os seus gastos e corte supérfluos');
        }

        if (categoryArray.length > 0) {
          const topCategory = categoryArray[0];
          insights.push(`Seus gastos com ${topCategory.category} representam ${topCategory.percentage.toFixed(1)}% dos gastos totais.`);
        }

        let spendingPattern, riskLevel;
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

        return {
          statusCode: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(analysis)
        };
      } catch (error) {
        return {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: error.message
          })
        };
      }
    }

    // 404 Not Found
    return {
      statusCode: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: 'Route not found',
        path: path,
        method: method
      })
    };

  } catch (error) {
    console.error('❌ Erro na function:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      })
    };
  }
};