import { create } from 'zustand';
import type { Client, ClientFormData } from '@/types';

interface ClientStore {
  clients: Client[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addClient: (data: ClientFormData) => Promise<Client>;
  updateClient: (id: string, data: ClientFormData) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
}

// Mock data
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 99999-1234',
    company: 'Santos Consultoria',
    document: '12.345.678/0001-90',
    address: {
      street: 'Rua das Flores',
      number: '123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos@email.com',
    phone: '(21) 98888-5678',
    document: '987.654.321-00',
    address: {
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana.costa@empresa.com',
    phone: '(31) 97777-9012',
    company: 'Costa & Filhos LTDA',
    document: '45.678.901/0001-23',
    address: {
      street: 'Av. Brasil',
      number: '500',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30100-000',
    },
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@gmail.com',
    phone: '(41) 96666-3456',
    document: '456.789.012-34',
    createdAt: '2024-03-25T16:45:00Z',
    updatedAt: '2024-03-25T16:45:00Z',
  },
  {
    id: '5',
    name: 'Fernanda Lima',
    email: 'fernanda@lima.adv.br',
    phone: '(51) 95555-7890',
    company: 'Lima Advocacia',
    document: '78.901.234/0001-56',
    address: {
      street: 'Rua da Justiça',
      number: '42',
      city: 'Porto Alegre',
      state: 'RS',
      zipCode: '90000-000',
    },
    createdAt: '2024-04-05T11:20:00Z',
    updatedAt: '2024-04-05T11:20:00Z',
  },
];

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: mockClients,
  isLoading: false,
  searchTerm: '',

  setSearchTerm: (term) => set({ searchTerm: term }),

  addClient: async (data) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newClient: Client = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      clients: [...state.clients, newClient],
      isLoading: false,
    }));
    
    return newClient;
  },

  updateClient: async (id, data) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let updatedClient: Client | null = null;
    
    set((state) => ({
      clients: state.clients.map((client) => {
        if (client.id === id) {
          updatedClient = {
            ...client,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          return updatedClient;
        }
        return client;
      }),
      isLoading: false,
    }));
    
    return updatedClient!;
  },

  deleteClient: async (id) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
      isLoading: false,
    }));
  },

  getClientById: (id) => {
    return get().clients.find((client) => client.id === id);
  },
}));
