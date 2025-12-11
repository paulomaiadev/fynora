import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, FileText, Filter } from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { useClientStore } from "@/store/clientStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader, EmptyState, ConfirmDialog } from "@/components/global";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency, formatDate, BUDGET_STATUS_CONFIG } from "@/lib/constants";
import type { Budget, BudgetStatus } from "@/types";

const Budgets = () => {
  const { budgets, searchTerm, setSearchTerm, statusFilter, setStatusFilter, deleteBudget } =
    useBudgetStore();
  const { getClientById } = useClientStore();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const client = getClientById(budget.clientId);
      const matchesSearch =
        !searchTerm ||
        budget.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || budget.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchTerm, statusFilter, getClientById]);

  const handleDeleteConfirm = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (selectedBudget) {
      await deleteBudget(selectedBudget.id);
      toast.success("Orçamento excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedBudget(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Orçamentos"
        description="Gerencie seus orçamentos e propostas"
        action={
          <Link to="/budgets/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar orçamentos..."
            className="pl-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as BudgetStatus | "all")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="accepted">Aceito</SelectItem>
              <SelectItem value="rejected">Recusado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/50 bg-card shadow-soft overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBudgets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    icon={FileText}
                    title="Nenhum orçamento encontrado"
                    description={
                      searchTerm || statusFilter !== "all"
                        ? "Tente ajustar os filtros"
                        : "Crie seu primeiro orçamento"
                    }
                    action={
                      !searchTerm &&
                      statusFilter === "all" && (
                        <Link to="/budgets/new">
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Orçamento
                          </Button>
                        </Link>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredBudgets.map((budget, index) => {
                const client = getClientById(budget.clientId);
                return (
                  <motion.tr
                    key={budget.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group border-b border-border/50 transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-mono font-semibold">{budget.number}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {client?.name || "Cliente não encontrado"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {budget.items.length} item(s)
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(budget.total)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(budget.validUntil)}
                    </TableCell>
                    <TableCell>
                      <Badge className={BUDGET_STATUS_CONFIG[budget.status].className}>
                        {BUDGET_STATUS_CONFIG[budget.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to={`/budgets/${budget.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/budgets/${budget.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteConfirm(budget)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o orçamento "${selectedBudget?.number}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </motion.div>
  );
};

export default Budgets;
