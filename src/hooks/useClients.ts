import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientsApi, handleApiError, type GetClientsParams } from '@/services/api';
import { toast } from 'sonner';
import type { Client, ClientFormData } from '@/types';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: GetClientsParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

export function useClients(params: GetClientsParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClientFormData) => clientsApi.create(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success('Cliente criado com sucesso!');
      return newClient;
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Erro ao criar cliente');
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientFormData> }) =>
      clientsApi.update(id, data),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.setQueryData(clientKeys.detail(updatedClient.id), updatedClient);
      toast.success('Cliente atualizado com sucesso!');
      return updatedClient;
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Erro ao atualizar cliente');
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Erro ao excluir cliente');
    },
  });
}
