import api, { handleApiError } from './axios';
import type { Client, ClientFormData, PaginatedResponse } from '@/types';

// Mock data for development
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
    address: { city: 'Rio de Janeiro', state: 'RJ' },
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

// In-memory store for mock
let clientsStore = [...mockClients];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const clientsApi = {
  getAll: async (params?: GetClientsParams): Promise<PaginatedResponse<Client>> => {
    await delay(300);
    
    let filtered = [...clientsStore];
    
    // Search filter
    if (params?.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.company?.toLowerCase().includes(term) ||
          c.document.includes(term)
      );
    }
    
    // Sorting
    if (params?.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof Client] as string || '';
        const bVal = b[params.sortBy as keyof Client] as string || '';
        const order = params.sortOrder === 'desc' ? -1 : 1;
        return aVal.localeCompare(bVal) * order;
      });
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);
    
    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
    
    // Real API call
    // const response = await api.get<PaginatedResponse<Client>>('/clients', { params });
    // return response.data;
  },
  
  getById: async (id: string): Promise<Client> => {
    await delay(200);
    
    const client = clientsStore.find((c) => c.id === id);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }
    return client;
    
    // Real API call
    // const response = await api.get<Client>(`/clients/${id}`);
    // return response.data;
  },
  
  create: async (data: ClientFormData): Promise<Client> => {
    await delay(500);
    
    const newClient: Client = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    clientsStore.push(newClient);
    return newClient;
    
    // Real API call
    // const response = await api.post<Client>('/clients', data);
    // return response.data;
  },
  
  update: async (id: string, data: Partial<ClientFormData>): Promise<Client> => {
    await delay(500);
    
    const index = clientsStore.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Cliente não encontrado');
    }
    
    clientsStore[index] = {
      ...clientsStore[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return clientsStore[index];
    
    // Real API call
    // const response = await api.patch<Client>(`/clients/${id}`, data);
    // return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await delay(500);
    
    clientsStore = clientsStore.filter((c) => c.id !== id);
    
    // Real API call
    // await api.delete(`/clients/${id}`);
  },
};

export { handleApiError };
