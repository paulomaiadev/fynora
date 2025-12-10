import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, handleApiError, type GetBudgetsParams } from '@/services/api';
import { toast } from 'sonner';
import type { Budget, BudgetFormData, BudgetStatus } from '@/types';

export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: (params: GetBudgetsParams) => [...budgetKeys.lists(), params] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
};

export function useBudgets(params: GetBudgetsParams = {}) {
  return useQuery({
    queryKey: budgetKeys.list(params),
    queryFn: () => budgetsApi.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => budgetsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BudgetFormData) => budgetsApi.create(data),
    onSuccess: (newBudget) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      toast.success('Orçamento criado com sucesso!');
      return newBudget;
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Erro ao criar orçamento');
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetFormData> }) =>
      budgetsApi.update(id, data),
    onSuccess: (updatedBudget) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.setQueryData(budgetKeys.detail(updatedBudget.id), updatedBudget);
      toast.success('Orçamento atualizado com sucesso!');
      return updatedBudget;
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Erro ao atualizar orçamento');
    },
  });
}

export function useUpdateBudgetStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BudgetStatus }) =>
      budgetsApi.updateStatus(id, status),
    onSuccess: (updatedBudget) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.setQueryData(budgetKeys.detail(updatedBudget.id), updatedBudget);
      toast.success('Status atualizado com sucesso!');
      return updatedBudget;
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Erro ao atualizar status');
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      queryClient.removeQueries({ queryKey: budgetKeys.detail(id) });
      toast.success('Orçamento excluído com sucesso!');
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      toast.error(apiError.message || 'Erro ao excluir orçamento');
    },
  });
}
