import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, FileText, Filter } from 'lucide-react';
import { useBudgetStore } from '@/store/budgetStore';
import { useClientStore } from '@/store/clientStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Budget, BudgetStatus } from '@/types';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const statusConfig = {
  draft: { label: 'Rascunho', variant: 'secondary' as const, className: '' },
  sent: { label: 'Enviado', variant: 'default' as const, className: 'bg-warning text-warning-foreground' },
  accepted: { label: 'Aceito', variant: 'default' as const, className: 'bg-success text-success-foreground' },
  rejected: { label: 'Recusado', variant: 'destructive' as const, className: '' },
};

const Budgets = () => {
  const { budgets, searchTerm, setSearchTerm, statusFilter, setStatusFilter, deleteBudget } = useBudgetStore();
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
      const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
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
      toast.success('Orçamento excluído com sucesso!');
      setIsDeleteOpen(false);
      setSelectedBudget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus orçamentos e propostas
          </p>
        </div>
        <Link to="/budgets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar orçamentos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as BudgetStatus | 'all')}
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
      <div className="rounded-lg border bg-card">
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
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="mb-2 h-8 w-8" />
                    <p>Nenhum orçamento encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBudgets.map((budget) => {
                const client = getClientById(budget.clientId);
                return (
                  <TableRow key={budget.id} className="group">
                    <TableCell className="font-mono font-medium">{budget.number}</TableCell>
                    <TableCell>{client?.name || 'Cliente não encontrado'}</TableCell>
                    <TableCell>{budget.items.length} item(s)</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(budget.total)}</TableCell>
                    <TableCell>
                      {new Date(budget.validUntil).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusConfig[budget.status].variant}
                        className={cn(statusConfig[budget.status].className)}
                      >
                        {statusConfig[budget.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento "{selectedBudget?.number}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Budgets;
