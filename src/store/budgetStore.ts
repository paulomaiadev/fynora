import { create } from 'zustand';
import type { Budget, BudgetFormData, BudgetItem, BudgetStatus } from '@/types';
import { useClientStore } from './clientStore';

interface BudgetStore {
  budgets: Budget[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: BudgetStatus | 'all';
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: BudgetStatus | 'all') => void;
  addBudget: (data: BudgetFormData) => Promise<Budget>;
  updateBudget: (id: string, data: Partial<BudgetFormData>) => Promise<Budget>;
  updateBudgetStatus: (id: string, status: BudgetStatus) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetById: (id: string) => Budget | undefined;
  generateBudgetNumber: () => string;
}

// Generate budget number
const generateNumber = (count: number): string => {
  const year = new Date().getFullYear();
  const num = String(count + 1).padStart(4, '0');
  return `ORC-${year}-${num}`;
};

// Mock data
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

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: mockBudgets,
  isLoading: false,
  searchTerm: '',
  statusFilter: 'all',

  setSearchTerm: (term) => set({ searchTerm: term }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  generateBudgetNumber: () => {
    const count = get().budgets.length;
    return generateNumber(count);
  },

  addBudget: async (data) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const items: BudgetItem[] = data.items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
      total: item.quantity * item.unitPrice,
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - (data.discount || 0);
    
    const client = useClientStore.getState().getClientById(data.clientId);
    
    const newBudget: Budget = {
      id: Date.now().toString(),
      number: get().generateBudgetNumber(),
      clientId: data.clientId,
      client,
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
    
    set((state) => ({
      budgets: [...state.budgets, newBudget],
      isLoading: false,
    }));
    
    return newBudget;
  },

  updateBudget: async (id, data) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let updatedBudget: Budget | null = null;
    
    set((state) => ({
      budgets: state.budgets.map((budget) => {
        if (budget.id === id) {
          const items: BudgetItem[] = data.items?.map((item, index) => ({
            ...item,
            id: `item-${Date.now()}-${index}`,
            total: item.quantity * item.unitPrice,
          })) || budget.items;
          
          const subtotal = items.reduce((sum, item) => sum + item.total, 0);
          const total = subtotal - (data.discount ?? budget.discount ?? 0);
          
          updatedBudget = {
            ...budget,
            ...data,
            items,
            subtotal,
            total,
            updatedAt: new Date().toISOString(),
          };
          return updatedBudget;
        }
        return budget;
      }),
      isLoading: false,
    }));
    
    return updatedBudget!;
  },

  updateBudgetStatus: async (id, status) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    let updatedBudget: Budget | null = null;
    
    set((state) => ({
      budgets: state.budgets.map((budget) => {
        if (budget.id === id) {
          updatedBudget = {
            ...budget,
            status,
            updatedAt: new Date().toISOString(),
          };
          return updatedBudget;
        }
        return budget;
      }),
      isLoading: false,
    }));
    
    return updatedBudget!;
  },

  deleteBudget: async (id) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    set((state) => ({
      budgets: state.budgets.filter((budget) => budget.id !== id),
      isLoading: false,
    }));
  },

  getBudgetById: (id) => {
    const budget = get().budgets.find((b) => b.id === id);
    if (budget) {
      const client = useClientStore.getState().getClientById(budget.clientId);
      return { ...budget, client };
    }
    return undefined;
  },
}));
