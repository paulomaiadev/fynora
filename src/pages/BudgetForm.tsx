import { useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useBudgetStore } from '@/store/budgetStore';
import { useClientStore } from '@/store/clientStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface BudgetItemForm {
  name: string;
  quantity: number;
  unitPrice: number;
}

const BudgetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');
  
  const { addBudget, getBudgetById, updateBudget } = useBudgetStore();
  const { clients } = useClientStore();

  const existingBudget = id ? getBudgetById(id) : null;
  const isEditing = !!existingBudget;

  const [clientId, setClientId] = useState(
    existingBudget?.clientId || preselectedClientId || ''
  );
  const [validUntil, setValidUntil] = useState(
    existingBudget?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [discount, setDiscount] = useState(existingBudget?.discount?.toString() || '0');
  const [notes, setNotes] = useState(existingBudget?.notes || '');
  const [items, setItems] = useState<BudgetItemForm[]>(
    existingBudget?.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) || [{ name: '', quantity: 1, unitPrice: 0 }]
  );

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [items]);

  const total = useMemo(() => {
    return subtotal - (parseFloat(discount) || 0);
  }, [subtotal, discount]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof BudgetItemForm, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (items.some((item) => !item.name || item.unitPrice <= 0)) {
      toast.error('Preencha todos os itens corretamente');
      return;
    }

    const budgetData = {
      clientId,
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      discount: parseFloat(discount) || 0,
      validUntil,
      notes,
    };

    if (isEditing && existingBudget) {
      await updateBudget(existingBudget.id, budgetData);
      toast.success('Orçamento atualizado com sucesso!');
    } else {
      await addBudget(budgetData);
      toast.success('Orçamento criado com sucesso!');
    }

    navigate('/budgets');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/budgets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do orçamento' : 'Preencha os dados do novo orçamento'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
                <CardDescription>Selecione o cliente para este orçamento</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Itens</CardTitle>
                  <CardDescription>Adicione os itens do orçamento</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        {index === 0 && (
                          <Label className="mb-2 block text-xs">Descrição</Label>
                        )}
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Nome do item ou serviço"
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && (
                          <Label className="mb-2 block text-xs">Qtd</Label>
                        )}
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && (
                          <Label className="mb-2 block text-xs">Valor Unit.</Label>
                        )}
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && (
                          <Label className="mb-2 block text-xs">Total</Label>
                        )}
                        <Input
                          value={formatCurrency(item.quantity * item.unitPrice)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>Informações adicionais (opcional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Condições de pagamento, prazo de entrega, etc."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Validity */}
            <Card>
              <CardHeader>
                <CardTitle>Validade</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="validUntil" className="mb-2 block text-sm">
                  Data de validade
                </Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Desconto</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-32 text-right"
                  />
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                {isEditing ? 'Salvar Alterações' : 'Criar Orçamento'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/budgets')}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
