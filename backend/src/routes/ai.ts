import { Router } from 'express';
import { OpenAI } from 'openai';

const router = Router();

// Configuração da OpenAI (será configurada via env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test'
});

// Função para gerar análise inteligente baseada nas transações
function generateIntelligentAnalysis(transactions: any[], period: string) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Análise por categoria
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Insights inteligentes
  const insights = [];
  const suggestions = [];

  // Análise de balanço
  if (balance < 0) {
    insights.push({
      type: 'warning',
      message: `Atenção! Seus gastos superaram sua renda em R$ ${Math.abs(balance).toFixed(2)}`,
      category: 'Balanço'
    });
    suggestions.push('Revise seus gastos para equilibrar o orçamento');
    suggestions.push('Considere cortar gastos desnecessários');
  } else if (balance > 0) {
    insights.push({
      type: 'positive',
      message: `Parabéns! Você conseguiu economizar R$ ${balance.toFixed(2)} este período`,
      category: 'Economia'
    });
    suggestions.push('Continue mantendo esse controle financeiro');
    suggestions.push('Considere investir o valor economizado');
  }

  // Análise de categorias com maior gasto
  const sortedExpenses = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => (b as number) - (a as number));

  if (sortedExpenses.length > 0) {
    const [topCategory, topAmount] = sortedExpenses[0];
    const topAmountNumber = topAmount as number;
    const percentOfTotal = (topAmountNumber / totalExpenses) * 100;
    
    if (percentOfTotal > 40) {
      insights.push({
        type: 'warning',
        message: `${topCategory} representa ${percentOfTotal.toFixed(1)}% dos seus gastos (R$ ${topAmountNumber.toFixed(2)})`,
        category: topCategory
      });
      suggestions.push(`Analise se os gastos com ${topCategory} podem ser reduzidos`);
    } else if (percentOfTotal > 25) {
      insights.push({
        type: 'suggestion',
        message: `${topCategory} é sua maior categoria de gasto (R$ ${topAmountNumber.toFixed(2)})`,
        category: topCategory
      });
      suggestions.push(`Defina um orçamento mensal para ${topCategory}`);
    }
  }

  // Análise de frequência de transações
  const transactionCount = transactions.length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;
  const avgExpenseAmount = totalExpenses / expenseCount;

  if (avgExpenseAmount > 200) {
    insights.push({
      type: 'suggestion',
      message: `Suas transações têm valor médio alto (R$ ${avgExpenseAmount.toFixed(2)})`,
      category: 'Comportamento'
    });
    suggestions.push('Considere fazer mais compras de menor valor para melhor controle');
  }

  // Análise de diversificação de receitas
  const incomeCategories = Object.keys(incomeByCategory).length;
  if (incomeCategories === 1) {
    insights.push({
      type: 'suggestion',
      message: 'Você possui apenas uma fonte de renda',
      category: 'Renda'
    });
    suggestions.push('Considere diversificar suas fontes de renda');
    suggestions.push('Explore oportunidades de renda extra');
  }

  // Sugestões gerais baseadas no comportamento
  if (transactionCount < 5) {
    suggestions.push('Registre mais transações para análises mais precisas');
  }

  suggestions.push('Use a categorização automática para organizar melhor seus gastos');
  suggestions.push('Defina metas mensais para cada categoria de gasto');
  suggestions.push('Revise seus gastos semanalmente para manter o controle');

  return {
    summary: {
      totalIncome,
      totalExpenses,
      balance,
      period,
      transactionCount,
      averageExpense: avgExpenseAmount,
      topExpenseCategory: sortedExpenses[0]?.[0] || 'N/A'
    },
    insights,
    suggestions: suggestions.slice(0, 6), // Limita a 6 sugestões
    categoryBreakdown: {
      expenses: expensesByCategory,
      income: incomeByCategory
    }
  };
}

// POST /api/ai/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { transactions, period = '30d' } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Transações são obrigatórias' });
    }

    console.log('🤖 [AI] Analisando', transactions.length, 'transações para período:', period);

    // Análise inteligente baseada nas transações reais
    const analysis = generateIntelligentAnalysis(transactions, period);

    console.log('🧠 [AI] Análise gerada:', {
      totalTransactions: transactions.length,
      insights: analysis.insights.length,
      suggestions: analysis.suggestions.length
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao analisar gastos' });
  }
});

// POST /api/ai/categorize
router.post('/categorize', async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    // Mock da categorização automática
    const categories = {
      'supermercado': 'Alimentação',
      'restaurante': 'Alimentação',
      'cinema': 'Entretenimento',
      'netflix': 'Entretenimento',
      'uber': 'Transporte',
      'gasolina': 'Transporte',
      'farmácia': 'Saúde',
      'academia': 'Saúde',
      'salário': 'Trabalho',
      'freelance': 'Trabalho'
    };

    const lowerDesc = description.toLowerCase();
    let suggestedCategory = 'Outros';

    for (const [keyword, category] of Object.entries(categories)) {
      if (lowerDesc.includes(keyword)) {
        suggestedCategory = category;
        break;
      }
    }

    res.json({ 
      suggestedCategory,
      confidence: 0.85
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao categorizar' });
  }
});

export { router as aiRoutes };