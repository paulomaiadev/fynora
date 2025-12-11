import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText
} from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { useClientStore } from '@/store/clientStore';
import { useBudgetStore } from '@/store/budgetStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const Dashboard = () => {
  const { getSummary, getChartData, getRecentTransactions } = useFinanceStore();
  const { clients } = useClientStore();
  const { budgets } = useBudgetStore();

  const summary = useMemo(() => getSummary(), [getSummary]);
  const chartData = useMemo(() => getChartData(), [getChartData]);
  const recentTransactions = useMemo(() => getRecentTransactions(5), [getRecentTransactions]);

  const pendingBudgets = budgets.filter((b) => b.status === 'sent').length;

  const stats = [
    {
      title: 'Receitas',
      value: formatCurrency(summary.totalIncome),
      change: `+${summary.incomeChange}%`,
      positive: true,
      icon: TrendingUp,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      title: 'Despesas',
      value: formatCurrency(summary.totalExpenses),
      change: `${summary.expensesChange}%`,
      positive: true,
      icon: TrendingDown,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
    },
    {
      title: 'Saldo',
      value: formatCurrency(summary.balance),
      change: `+${summary.balanceChange}%`,
      positive: true,
      icon: DollarSign,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: 'Clientes',
      value: clients.length.toString(),
      subtitle: `${pendingBudgets} orçamentos pendentes`,
      icon: Users,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={item} className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do seu negócio</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="card-interactive">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl lg:text-3xl font-bold tracking-tight">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-success" />
                      <span className="font-medium text-success">{stat.change}</span>
                      <span className="text-muted-foreground">vs mês anterior</span>
                    </div>
                  )}
                  {stat.subtitle && (
                    <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                  )}
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', stat.iconBg)}>
                  <stat.icon className={cn('h-6 w-6', stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="income" name="Receitas" stroke="hsl(var(--success))" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expenses" name="Despesas" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Status dos Orçamentos</CardTitle>
            <CardDescription>Distribuição por status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Rascunho', value: budgets.filter(b => b.status === 'draft').length },
                  { name: 'Enviado', value: budgets.filter(b => b.status === 'sent').length },
                  { name: 'Aceito', value: budgets.filter(b => b.status === 'accepted').length },
                  { name: 'Recusado', value: budgets.filter(b => b.status === 'rejected').length },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" width={70} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas Transações</CardTitle>
              <CardDescription>Movimentações recentes</CardDescription>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all hover:bg-secondary/50 hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                      {transaction.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-lg font-bold', transaction.type === 'income' ? 'text-success' : 'text-destructive')}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant="ghost">{transaction.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
