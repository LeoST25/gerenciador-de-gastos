export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense' | 'both';
  color?: string;
  icon?: string;
}

export interface AIAnalysis {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    period: string;
  };
  insights: {
    type: 'warning' | 'suggestion' | 'positive';
    message: string;
    category: string;
  }[];
  suggestions: string[];
}

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }[];
  categoriesExpenses: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  recentTransactions: Transaction[];
}

export interface ChartData {
  incomeVsExpenses: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
    }[];
  };
  categoriesDistribution: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
  };
  savingsOverTime: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
    }[];
  };
}