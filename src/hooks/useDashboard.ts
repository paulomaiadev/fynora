import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type DashboardData } from '@/services/api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
  transactions: (limit?: number) => [...dashboardKeys.all, 'transactions', limit] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: dashboardApi.getData,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useRecentTransactions(limit: number = 5) {
  return useQuery({
    queryKey: dashboardKeys.transactions(limit),
    queryFn: () => dashboardApi.getTransactions(limit),
    staleTime: 60 * 1000,
  });
}

export type { DashboardData };
