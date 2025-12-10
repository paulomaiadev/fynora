import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Download, Send, Check, X, User, Calendar, FileText } from 'lucide-react';
import { useBudgetStore } from '@/store/budgetStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { BudgetStatus } from '@/types';

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

const BudgetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBudgetById, updateBudgetStatus } = useBudgetStore();

  const budget = getBudgetById(id || '');

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Orçamento não encontrado</p>
        <Button variant="link" onClick={() => navigate('/budgets')}>
          Voltar para orçamentos
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (status: BudgetStatus) => {
    await updateBudgetStatus(budget.id, status);
    toast.success(`Status atualizado para ${statusConfig[status].label}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/budgets')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{budget.number}</h1>
              <Badge
                variant={statusConfig[budget.status].variant}
                className={cn(statusConfig[budget.status].className)}
              >
                {statusConfig[budget.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Criado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Link to={`/budgets/${budget.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Itens do Orçamento</CardTitle>
            <CardDescription>
              {budget.items.length} item(s) no orçamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Items List */}
              <div className="rounded-lg border">
                <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Qtd</div>
                  <div className="col-span-2 text-right">Valor Unit.</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                {budget.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 border-b p-4 last:border-0"
                  >
                    <div className="col-span-5 font-medium">{item.name}</div>
                    <div className="col-span-2 text-center text-muted-foreground">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                      {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="col-span-3 text-right font-semibold">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(budget.subtotal)}</span>
                </div>
                {budget.discount && budget.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="text-destructive">-{formatCurrency(budget.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(budget.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {budget.notes && (
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Observações</h4>
                  <p className="text-sm text-muted-foreground">{budget.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                to={`/clients/${budget.clientId}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{budget.client?.name}</p>
                  <p className="text-sm text-muted-foreground">{budget.client?.email}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Validity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {new Date(budget.validUntil).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Data de validade</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {budget.status === 'draft' && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('sent')}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Marcar como Enviado
                </Button>
              )}
              {budget.status === 'sent' && (
                <>
                  <Button
                    className="w-full bg-success hover:bg-success/90"
                    onClick={() => handleStatusChange('accepted')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Marcar como Aceito
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleStatusChange('rejected')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Marcar como Recusado
                  </Button>
                </>
              )}
              {(budget.status === 'accepted' || budget.status === 'rejected') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange('draft')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Voltar para Rascunho
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetail;
