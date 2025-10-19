import { TransactionModel, Transaction, CreateTransactionSchema, UpdateTransactionSchema } from '../models/Transaction';
import { z } from 'zod';

export class TransactionService {
  private transactionModel: TransactionModel;

  constructor() {
    this.transactionModel = new TransactionModel();
  }

  // Categorias padrão para sugestões
  private readonly defaultCategories = {
    income: [
      'Salário',
      'Freelance',
      'Investimentos',
      'Venda',
      'Presente',
      'Outros'
    ],
    expense: [
      'Alimentação',
      'Transporte',
      'Moradia',
      'Saúde',
      'Educação',
      'Lazer',
      'Roupas',
      'Tecnologia',
      'Outros'
    ]
  };

  // Criar transação com validações adicionais
  async createTransaction(userId: number, data: z.infer<typeof CreateTransactionSchema>): Promise<Transaction> {
    // Validar dados
    const validatedData = CreateTransactionSchema.parse(data);

    // Normalizar categoria
    validatedData.category = this.normalizeCategory(validatedData.category);

    // Garantir que o valor seja positivo
    validatedData.amount = Math.abs(validatedData.amount);

    // Se não fornecida, usar data atual
    if (!validatedData.date) {
      validatedData.date = new Date().toISOString();
    }

    return await this.transactionModel.create(userId, validatedData);
  }

  // Buscar transações com filtros
  async getTransactions(userId: number, filters?: {
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: Transaction[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const transactions = await this.transactionModel.findByUserId(userId, filters);

    return {
      transactions,
      pagination: {
        limit,
        offset,
        total: transactions.length,
        hasMore: transactions.length === limit
      }
    };
  }

  // Obter resumo financeiro detalhado
  async getFinancialSummary(userId: number, filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    averageIncome: number;
    averageExpense: number;
    topCategories: {
      income: Array<{ category: string; total: number }>;
      expense: Array<{ category: string; total: number }>;
    };
  }> {
    const summary = await this.transactionModel.getSummary(userId, filters);
    const transactions = await this.transactionModel.findByUserId(userId, filters);

    // Calcular médias
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const averageIncome = incomeTransactions.length > 0 
      ? summary.totalIncome / incomeTransactions.length 
      : 0;

    const averageExpense = expenseTransactions.length > 0 
      ? summary.totalExpense / expenseTransactions.length 
      : 0;

    // Top categorias
    const topCategories = this.calculateTopCategories(transactions);

    return {
      ...summary,
      averageIncome,
      averageExpense,
      topCategories
    };
  }

  // Atualizar transação
  async updateTransaction(id: number, userId: number, data: z.infer<typeof UpdateTransactionSchema>): Promise<Transaction | null> {
    const validatedData = UpdateTransactionSchema.parse(data);

    // Normalizar categoria se fornecida
    if (validatedData.category) {
      validatedData.category = this.normalizeCategory(validatedData.category);
    }

    // Garantir que o valor seja positivo se fornecido
    if (validatedData.amount !== undefined) {
      validatedData.amount = Math.abs(validatedData.amount);
    }

    return await this.transactionModel.update(id, userId, validatedData);
  }

  // Deletar transação
  async deleteTransaction(id: number, userId: number): Promise<boolean> {
    return await this.transactionModel.delete(id, userId);
  }

  // Obter transação por ID
  async getTransactionById(id: number, userId: number): Promise<Transaction | null> {
    return await this.transactionModel.findById(id, userId);
  }

  // Obter categorias utilizadas pelo usuário + sugestões
  async getCategories(userId: number): Promise<{
    userCategories: string[];
    suggestions: {
      income: string[];
      expense: string[];
    };
  }> {
    const userCategories = await this.transactionModel.getCategories(userId);

    return {
      userCategories,
      suggestions: this.defaultCategories
    };
  }

  // Obter estatísticas mensais
  async getMonthlyStats(userId: number, year: number): Promise<Array<{
    month: number;
    monthName: string;
    income: number;
    expense: number;
    balance: number;
    transactionCount: number;
  }>> {
    const stats = [];
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

      const summary = await this.transactionModel.getSummary(userId, {
        startDate,
        endDate
      });

      stats.push({
        month,
        monthName: monthNames[month - 1],
        income: summary.totalIncome,
        expense: summary.totalExpense,
        balance: summary.balance,
        transactionCount: summary.transactionCount
      });
    }

    return stats;
  }

  // Métodos auxiliares privados
  private normalizeCategory(category: string): string {
    return category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
  }

  private calculateTopCategories(transactions: Transaction[]): {
    income: Array<{ category: string; total: number }>;
    expense: Array<{ category: string; total: number }>;
  } {
    const incomeCategories: { [key: string]: number } = {};
    const expenseCategories: { [key: string]: number } = {};

    transactions.forEach(transaction => {
      const category = transaction.category;
      const amount = transaction.amount;

      if (transaction.type === 'income') {
        incomeCategories[category] = (incomeCategories[category] || 0) + amount;
      } else {
        expenseCategories[category] = (expenseCategories[category] || 0) + amount;
      }
    });

    const sortAndLimit = (categories: { [key: string]: number }) => 
      Object.entries(categories)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    return {
      income: sortAndLimit(incomeCategories),
      expense: sortAndLimit(expenseCategories)
    };
  }

  // Validar se uma transação pode ser deletada (regras de negócio futuras)
  async canDeleteTransaction(id: number, userId: number): Promise<boolean> {
    const transaction = await this.transactionModel.findById(id, userId);
    if (!transaction) {
      return false;
    }

    // Por enquanto, todas as transações podem ser deletadas
    // No futuro, pode incluir regras como: não deletar transações muito antigas,
    // não deletar se vinculada a relatórios fiscais, etc.
    return true;
  }

  // Duplicar transação
  async duplicateTransaction(id: number, userId: number): Promise<Transaction | null> {
    const originalTransaction = await this.transactionModel.findById(id, userId);
    if (!originalTransaction) {
      return null;
    }

    const duplicateData = {
      type: originalTransaction.type,
      amount: originalTransaction.amount,
      category: originalTransaction.category,
      description: `${originalTransaction.description} (cópia)`,
      date: new Date().toISOString()
    };

    return await this.createTransaction(userId, duplicateData);
  }
}