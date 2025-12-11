import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Download,
  Send,
  Check,
  X,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { useBudgetStore } from "@/store/budgetStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/global";
import { toast } from "sonner";
import { formatCurrency, formatDateLong, BUDGET_STATUS_CONFIG } from "@/lib/constants";
import type { BudgetStatus } from "@/types";

const BudgetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBudgetById, updateBudgetStatus } = useBudgetStore();

  const budget = getBudgetById(id || "");

  if (!budget) {
    return (
      <EmptyState
        icon={FileText}
        title="Orçamento não encontrado"
        description="O orçamento que você procura não existe ou foi removido."
        action={
          <Button onClick={() => navigate("/budgets")}>Voltar para orçamentos</Button>
        }
      />
    );
  }

  const handleStatusChange = async (status: BudgetStatus) => {
    await updateBudgetStatus(budget.id, status);
    toast.success(`Status atualizado para ${BUDGET_STATUS_CONFIG[status].label}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/budgets")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{budget.number}</h1>
              <Badge className={BUDGET_STATUS_CONFIG[budget.status].className}>
                {BUDGET_STATUS_CONFIG[budget.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Criado em {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-xl">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Itens do Orçamento</CardTitle>
              <CardDescription>{budget.items.length} item(s) no orçamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Items List */}
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 border-b bg-muted/30 p-4 text-sm font-semibold text-muted-foreground">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Qtd</div>
                  <div className="col-span-2 text-right">Valor Unit.</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                {budget.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-4 border-b border-border/50 p-4 last:border-0"
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
                  </motion.div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 rounded-xl bg-muted/30 p-5">
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
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(budget.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {budget.notes && (
                <div className="rounded-xl border border-border/50 p-5">
                  <h4 className="mb-2 font-semibold">Observações</h4>
                  <p className="text-sm text-muted-foreground">{budget.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/clients/${budget.clientId}`}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-4 transition-all hover:bg-muted/50 hover:border-border hover:shadow-soft"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{budget.client?.name}</p>
                    <p className="text-sm text-muted-foreground">{budget.client?.email}</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Validity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Validade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{formatDateLong(budget.validUntil)}</p>
                    <p className="text-sm text-muted-foreground">Data de validade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {budget.status === "draft" && (
                  <Button className="w-full" onClick={() => handleStatusChange("sent")}>
                    <Send className="mr-2 h-4 w-4" />
                    Marcar como Enviado
                  </Button>
                )}
                {budget.status === "sent" && (
                  <>
                    <Button
                      className="w-full bg-success hover:bg-success/90"
                      onClick={() => handleStatusChange("accepted")}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Marcar como Aceito
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleStatusChange("rejected")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Marcar como Recusado
                    </Button>
                  </>
                )}
                {(budget.status === "accepted" || budget.status === "rejected") && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange("draft")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Voltar para Rascunho
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetDetail;
