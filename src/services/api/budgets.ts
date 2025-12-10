import api, { handleApiError } from './axios';
import type { Budget, BudgetFormData, BudgetItem, BudgetStatus, PaginatedResponse } from '@/types';
import { clientsApi } from './clients';

// Mock data for development
const mockBudgets: Budget[] = [
  {
    id: '1',
    number: 'ORC-2024-0001',
    clientId: '1',
    items: [
      { id: '1', name: 'Consultoria em Marketing Digital', quantity: 1, unitPrice: 2500, total: 2500 },
      { id: '2', name: 'Gestão de Redes Sociais (mensal)', quantity: 3, unitPrice: 800, total: 2400 },
    ],
    subtotal: 4900,
    discount: 0,
    total: 4900,
    status: 'accepted',
    validUntil: '2024-04-15',
    notes: 'Inclui relatórios mensais de performance.',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z',
  },
  {
    id: '2',
    number: 'ORC-2024-0002',
    clientId: '2',
    items: [
      { id: '1', name: 'Desenvolvimento de Website', quantity: 1, unitPrice: 5000, total: 5000 },
      { id: '2', name: 'Hospedagem (anual)', quantity: 1, unitPrice: 600, total: 600 },
    ],
    subtotal: 5600,
    discount: 300,
    total: 5300,
    status: 'sent',
    validUntil: '2024-04-30',
    createdAt: '2024-04-01T09:15:00Z',
    updatedAt: '2024-04-01T09:15:00Z',
  },
  {
    id: '3',
    number: 'ORC-2024-0003',
    clientId: '3',
    items: [
      { id: '1', name: 'Identidade Visual Completa', quantity: 1, unitPrice: 3500, total: 3500 },
      { id: '2', name: 'Manual de Marca', quantity: 1, unitPrice: 1200, total: 1200 },
      { id: '3', name: 'Papelaria Básica', quantity: 1, unitPrice: 800, total: 800 },
    ],
    subtotal: 5500,
    discount: 500,
    total: 5000,
    status: 'draft',
    validUntil: '2024-05-15',
    notes: 'Prazo de entrega: 30 dias úteis após aprovação.',
    createdAt: '2024-04-10T16:45:00Z',
    updatedAt: '2024-04-10T16:45:00Z',
  },
  {
    id: '4',
    number: 'ORC-2024-0004',
    clientId: '4',
    items: [
      { id: '1', name: 'Fotografia de Produto', quantity: 20, unitPrice: 150, total: 3000 },
    ],
    subtotal: 3000,
    total: 3000,
    status: 'rejected',
    validUntil: '2024-03-30',
    createdAt: '2024-03-20T11:30:00Z',
    updatedAt: '2024-03-25T10:00:00Z',
  },
];

// In-memory store for mock
let budgetsStore = [...mockBudgets];
let budgetCounter = 4;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateNumber = (count: number): string => {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(4, '0');
  return `ORC-${year}-${num}`;
};

export interface GetBudgetsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BudgetStatus | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const budgetsApi = {
  getAll: async (params?: GetBudgetsParams): Promise<PaginatedResponse<Budget>> => {
    await delay(300);
    
    let filtered = [...budgetsStore];
    
    // Status filter
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((b) => b.status === params.status);
    }
    
    // Search filter
    if (params?.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter((b) => {
        return b.number.toLowerCase().includes(term);
      });
    }
    
    // Sorting by date descending by default
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    
    // Enrich with client data
    const enriched = await Promise.all(
      paginated.map(async (budget) => {
        try {
          const client = await clientsApi.getById(budget.clientId);
          return { ...budget, client };
        } catch {
          return budget;
        }
      })
    );
    
    return {
      data: enriched,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },
  
  getById: async (id: string): Promise<Budget> => {
    await delay(200);
    
    const budget = budgetsStore.find((b) => b.id === id);
    if (!budget) {
      throw new Error('Orçamento não encontrado');
    }
    
    try {
      const client = await clientsApi.getById(budget.clientId);
      return { ...budget, client };
    } catch {
      return budget;
    }
  },
  
  create: async (data: BudgetFormData): Promise<Budget> => {
    await delay(500);
    
    budgetCounter++;
    
    const items: BudgetItem[] = data.items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
      total: item.quantity * item.unitPrice,
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - (data.discount || 0);
    
    const newBudget: Budget = {
      id: Date.now().toString(),
      number: generateNumber(budgetCounter),
      clientId: data.clientId,
      items,
      subtotal,
      discount: data.discount,
      total,
      status: 'draft',
      validUntil: data.validUntil,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    budgetsStore.push(newBudget);
    
    try {
      const client = await clientsApi.getById(newBudget.clientId);
      return { ...newBudget, client };
    } catch {
      return newBudget;
    }
  },
  
  update: async (id: string, data: Partial<BudgetFormData>): Promise<Budget> => {
    await delay(500);
    
    const index = budgetsStore.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('Orçamento não encontrado');
    }
    
    const budget = budgetsStore[index];
    
    const items: BudgetItem[] = data.items?.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`,
      total: item.quantity * item.unitPrice,
    })) || budget.items;
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - (data.discount ?? budget.discount ?? 0);
    
    budgetsStore[index] = {
      ...budget,
      ...data,
      items,
      subtotal,
      total,
      updatedAt: new Date().toISOString(),
    };
    
    return budgetsStore[index];
  },
  
  updateStatus: async (id: string, status: BudgetStatus): Promise<Budget> => {
    await delay(300);
    
    const index = budgetsStore.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('Orçamento não encontrado');
    }
    
    budgetsStore[index] = {
      ...budgetsStore[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    
    return budgetsStore[index];
  },
  
  delete: async (id: string): Promise<void> => {
    await delay(500);
    budgetsStore = budgetsStore.filter((b) => b.id !== id);
  },
};

export { handleApiError };
