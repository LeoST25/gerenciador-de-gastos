import { Router } from 'express';
import { OpenAI } from 'openai';

const router = Router();

// Configuração da OpenAI (será configurada via env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test'
});

// POST /api/ai/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { transactions, period = '30d' } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Transações são obrigatórias' });
    }

    // Mock da análise (substituir pela integração real com IA)
    const mockAnalysis = {
      summary: {
        totalIncome: transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
        balance: 0,
        period
      },
      insights: [
        {
          type: 'warning',
          message: 'Seus gastos com alimentação aumentaram 15% este mês',
          category: 'Alimentação'
        },
        {
          type: 'suggestion',
          message: 'Considere definir um orçamento mensal para entretenimento',
          category: 'Entretenimento'
        },
        {
          type: 'positive',
          message: 'Parabéns! Você conseguiu economizar R$ 500 este mês',
          category: 'Economia'
        }
      ],
      suggestions: [
        'Crie metas de economia específicas para cada categoria',
        'Considere usar aplicativos de cupom para reduzir gastos',
        'Revise seus gastos semanalmente para manter controle',
        'Defina um valor fixo para gastos variáveis'
      ]
    };

    mockAnalysis.summary.balance = mockAnalysis.summary.totalIncome - mockAnalysis.summary.totalExpenses;

    res.json(mockAnalysis);
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