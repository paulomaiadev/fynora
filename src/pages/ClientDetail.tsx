import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Mail, Phone, Building2, FileText, MapPin } from 'lucide-react';
import { useClientStore } from '@/store/clientStore';
import { useBudgetStore } from '@/store/budgetStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const statusConfig = {
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  sent: { label: 'Enviado', variant: 'default' as const },
  accepted: { label: 'Aceito', variant: 'default' as const },
  rejected: { label: 'Recusado', variant: 'destructive' as const },
};

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClientById } = useClientStore();
  const { budgets } = useBudgetStore();

  const client = getClientById(id || '');
  const clientBudgets = budgets.filter((b) => b.clientId === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <Button variant="link" onClick={() => navigate('/clients')}>
          Voltar para clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
            {client.company && (
              <p className="text-muted-foreground">{client.company}</p>
            )}
          </div>
        </div>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documento</p>
                <p className="font-mono font-medium">{client.document}</p>
              </div>
            </div>
            {client.address?.city && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {client.address.city}, {client.address.state}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budgets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Orçamentos</CardTitle>
              <CardDescription>
                {clientBudgets.length} orçamento(s) encontrado(s)
              </CardDescription>
            </div>
            <Link to={`/budgets/new?clientId=${client.id}`}>
              <Button size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Novo Orçamento
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {clientBudgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum orçamento para este cliente
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientBudgets.map((budget) => (
                  <Link
                    key={budget.id}
                    to={`/budgets/${budget.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{budget.number}</p>
                      <p className="text-sm text-muted-foreground">
                        Válido até {new Date(budget.validUntil).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(budget.total)}</p>
                      <Badge
                        variant={statusConfig[budget.status].variant}
                        className={
                          budget.status === 'accepted'
                            ? 'bg-success text-success-foreground'
                            : ''
                        }
                      >
                        {statusConfig[budget.status].label}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetail;
