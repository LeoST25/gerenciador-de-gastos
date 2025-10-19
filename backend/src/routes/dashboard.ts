import { Router } from 'express';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    // Mock dos dados do dashboard
    const mockSummary = {
      totalBalance: 4850.00,
      totalIncome: 5000.00,
      totalExpenses: 2150.00,
      savingsRate: 0.57,
      monthlyData: [
        { month: 'Jan', income: 4800, expenses: 3200, balance: 1600 },
        { month: 'Fev', income: 4900, expenses: 3100, balance: 1800 },
        { month: 'Mar', income: 5000, expenses: 2900, balance: 2100 },
        { month: 'Abr', income: 5100, expenses: 3300, balance: 1800 },
        { month: 'Mai', income: 5000, expenses: 2150, balance: 2850 }
      ],
      categoriesExpenses: [
        { category: 'Alimentação', amount: 800, percentage: 37 },
        { category: 'Transporte', amount: 450, percentage: 21 },
        { category: 'Entretenimento', amount: 300, percentage: 14 },
        { category: 'Saúde', amount: 200, percentage: 9 },
        { category: 'Educação', amount: 250, percentage: 12 },
        { category: 'Outros', amount: 150, percentage: 7 }
      ],
      recentTransactions: [
        {
          id: 1,
          type: 'expense',
          description: 'Supermercado Pão de Açúcar',
          category: 'Alimentação',
          amount: 89.50,
          date: new Date()
        },
        {
          id: 2,
          type: 'income',
          description: 'Salário Empresa XYZ',
          category: 'Trabalho',
          amount: 5000.00,
          date: new Date()
        },
        {
          id: 3,
          type: 'expense',
          description: 'Netflix Assinatura',
          category: 'Entretenimento',
          amount: 29.90,
          date: new Date()
        }
      ]
    };

    res.json(mockSummary);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

// GET /api/dashboard/charts
router.get('/charts', async (req, res) => {
  try {
    const { period = '6m' } = req.query;
    
    // Mock dos dados para gráficos
    const mockChartData = {
      incomeVsExpenses: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'Receitas',
            data: [4800, 4900, 5000, 5100, 5000, 5200],
            backgroundColor: '#10B981',
            borderColor: '#059669'
          },
          {
            label: 'Gastos',
            data: [3200, 3100, 2900, 3300, 2150, 2800],
            backgroundColor: '#EF4444',
            borderColor: '#DC2626'
          }
        ]
      },
      categoriesDistribution: {
        labels: ['Alimentação', 'Transporte', 'Entretenimento', 'Saúde', 'Educação', 'Outros'],
        datasets: [{
          data: [800, 450, 300, 200, 250, 150],
          backgroundColor: [
            '#3B82F6',
            '#8B5CF6',
            '#F59E0B',
            '#10B981',
            '#EF4444',
            '#6B7280'
          ]
        }]
      },
      savingsOverTime: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Economia Acumulada',
          data: [1600, 3400, 5500, 7300, 10150, 12500],
          borderColor: '#059669',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true
        }]
      }
    };

    res.json(mockChartData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados dos gráficos' });
  }
});

export { router as dashboardRoutes };