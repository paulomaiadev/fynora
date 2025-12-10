// Auth
export { useAuth } from './useAuth';

// Data hooks
export { useDashboard, useRecentTransactions, dashboardKeys } from './useDashboard';
export type { DashboardData } from './useDashboard';

export {
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  clientKeys,
} from './useClients';

export {
  useBudgets,
  useBudget,
  useCreateBudget,
  useUpdateBudget,
  useUpdateBudgetStatus,
  useDeleteBudget,
  budgetKeys,
} from './useBudgets';

// UI hooks
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';
