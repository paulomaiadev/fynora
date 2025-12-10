// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Client Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  document: string; // CPF or CNPJ
  address?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  document: string;
  address?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

// Budget Types
export interface BudgetItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type BudgetStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface Budget {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  items: BudgetItem[];
  subtotal: number;
  discount?: number;
  total: number;
  status: BudgetStatus;
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  clientId: string;
  items: Omit<BudgetItem, 'id' | 'total'>[];
  discount?: number;
  validUntil: string;
  notes?: string;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 
  | 'sales' 
  | 'services' 
  | 'supplies' 
  | 'rent' 
  | 'utilities' 
  | 'taxes' 
  | 'salary' 
  | 'marketing' 
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  clientId?: string;
  budgetId?: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeChange: number;
  expensesChange: number;
  balanceChange: number;
}

export interface ChartData {
  month: string;
  income: number;
  expenses: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
