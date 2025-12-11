import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Mail, Phone, Building2, FileText, MapPin } from "lucide-react";
import { useClientStore } from "@/store/clientStore";
import { useBudgetStore } from "@/store/budgetStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/global";
import { formatCurrency, BUDGET_STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClientById } = useClientStore();
  const { budgets } = useBudgetStore();

  const client = getClientById(id || "");
  const clientBudgets = budgets.filter((b) => b.clientId === id);

  if (!client) {
    return (
      <EmptyState
        icon={Building2}
        title="Cliente não encontrado"
        description="O cliente que você procura não existe ou foi removido."
        action={
          <Button onClick={() => navigate("/clients")}>
            Voltar para clientes
          </Button>
        }
      />
    );
  }

  const contactInfo = [
    { icon: Mail, label: "E-mail", value: client.email },
    { icon: Phone, label: "Telefone", value: client.phone },
    { icon: Building2, label: "Documento", value: client.document, mono: true },
    ...(client.address?.city
      ? [
          {
            icon: MapPin,
            label: "Localização",
            value: `${client.address.city}, ${client.address.state}`,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/clients")}
            className="rounded-xl"
          >
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={cn("font-medium", item.mono && "font-mono")}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Budgets */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
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
                <EmptyState
                  icon={FileText}
                  title="Nenhum orçamento"
                  description="Este cliente ainda não possui orçamentos"
                  size="sm"
                />
              ) : (
                <div className="space-y-3">
                  {clientBudgets.map((budget, index) => (
                    <motion.div
                      key={budget.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={`/budgets/${budget.id}`}
                        className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/50 hover:border-border hover:shadow-soft"
                      >
                        <div>
                          <p className="font-semibold">{budget.number}</p>
                          <p className="text-sm text-muted-foreground">
                            Válido até{" "}
                            {new Date(budget.validUntil).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(budget.total)}
                          </p>
                          <Badge className={BUDGET_STATUS_CONFIG[budget.status].className}>
                            {BUDGET_STATUS_CONFIG[budget.status].label}
                          </Badge>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ClientDetail;
