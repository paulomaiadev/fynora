import api, { handleApiError } from './axios';
import type { Transaction, DashboardSummary, ChartData } from '@/types';

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'services',
    description: 'Consultoria para Maria Santos',
    amount: 4900,
    date: '2024-03-20',
    clientId: '1',
    budgetId: '1',
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    type: 'expense',
    category: 'supplies',
    description: 'Material de escritório',
    amount: 350,
    date: '2024-03-18',
    createdAt: '2024-03-18T14:30:00Z',
  },
  {
    id: '3',
    type: 'income',
    category: 'sales',
    description: 'Venda de produtos digitais',
    amount: 1200,
    date: '2024-03-15',
    createdAt: '2024-03-15T09:15:00Z',
  },
  {
    id: '4',
    type: 'expense',
    category: 'marketing',
    description: 'Anúncios Google Ads',
    amount: 500,
    date: '2024-03-12',
    createdAt: '2024-03-12T16:45:00Z',
  },
  {
    id: '5',
    type: 'income',
    category: 'services',
    description: 'Desenvolvimento de site',
    amount: 5300,
    date: '2024-03-10',
    clientId: '2',
    createdAt: '2024-03-10T11:20:00Z',
  },
  {
    id: '6',
    type: 'expense',
    category: 'rent',
    description: 'Aluguel do escritório',
    amount: 1500,
    date: '2024-03-05',
    createdAt: '2024-03-05T08:00:00Z',
  },
  {
    id: '7',
    type: 'expense',
    category: 'utilities',
    description: 'Conta de energia',
    amount: 280,
    date: '2024-03-03',
    createdAt: '2024-03-03T10:30:00Z',
  },
  {
    id: '8',
    type: 'income',
    category: 'services',
    description: 'Manutenção mensal - Cliente Premium',
    amount: 2000,
    date: '2024-03-01',
    createdAt: '2024-03-01T09:00:00Z',
  },
];

const mockChartData: ChartData[] = [
  { month: 'Out', income: 8500, expenses: 3200 },
  { month: 'Nov', income: 12000, expenses: 4100 },
  { month: 'Dez', income: 15500, expenses: 5800 },
  { month: 'Jan', income: 9800, expenses: 3500 },
  { month: 'Fev', income: 11200, expenses: 4200 },
  { month: 'Mar', income: 13400, expenses: 2630 },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface DashboardData {
  summary: DashboardSummary;
  chartData: ChartData[];
  recentTransactions: Transaction[];
  stats: {
    totalClients: number;
    pendingBudgets: number;
    acceptedBudgets: number;
  };
}

export const dashboardApi = {
  getData: async (): Promise<DashboardData> => {
    await delay(400);
    
    const transactions = mockTransactions;
    
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        incomeChange: 12.5,
        expensesChange: -8.3,
        balanceChange: 18.2,
      },
      chartData: mockChartData,
      recentTransactions: transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
      stats: {
        totalClients: 5,
        pendingBudgets: 1,
        acceptedBudgets: 1,
      },
    };
    
    // Real API call
    // const response = await api.get<DashboardData>('/dashboard');
    // return response.data;
  },
  
  getTransactions: async (limit?: number): Promise<Transaction[]> => {
    await delay(200);
    
    return mockTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit || 10);
  },
};

export { handleApiError };
