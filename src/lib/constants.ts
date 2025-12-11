// Status configuration for budgets
export const BUDGET_STATUS_CONFIG = {
  draft: {
    label: "Rascunho",
    variant: "secondary" as const,
    className: "bg-secondary text-secondary-foreground",
  },
  sent: {
    label: "Enviado",
    variant: "warning" as const,
    className: "bg-warning text-warning-foreground",
  },
  accepted: {
    label: "Aceito",
    variant: "success" as const,
    className: "bg-success text-success-foreground",
  },
  rejected: {
    label: "Recusado",
    variant: "destructive" as const,
    className: "bg-destructive text-destructive-foreground",
  },
} as const;

// Format currency helper
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Format date helper
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("pt-BR");
};

// Format date long
export const formatDateLong = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Validate CPF/CNPJ (basic)
export const isValidDocument = (doc: string): boolean => {
  const cleaned = doc.replace(/\D/g, "");
  return cleaned.length === 11 || cleaned.length === 14;
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
