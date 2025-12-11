import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/global";
import AppLayout from "@/components/layout/AppLayout";

// Lazy load pages for better performance
const Login = lazy(() => import("@/features/auth/pages/Login"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const Clients = lazy(() => import("@/features/clients/pages/Clients"));
const ClientDetail = lazy(() => import("@/features/clients/pages/ClientDetail"));
const Budgets = lazy(() => import("@/features/budgets/pages/Budgets"));
const BudgetDetail = lazy(() => import("@/features/budgets/pages/BudgetDetail"));
const BudgetForm = lazy(() => import("@/features/budgets/pages/BudgetForm"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Loading fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route (redirects if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="budgets/new" element={<BudgetForm />} />
            <Route path="budgets/:id" element={<BudgetDetail />} />
            <Route path="budgets/:id/edit" element={<BudgetForm />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
