import { useState, useEffect } from "react";
import { useClientStore } from "@/store/clientStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Client, ClientFormData } from "@/types";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  client?: Client | null;
}

const initialFormData: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  document: "",
  address: {},
};

export const ClientFormDialog = ({
  open,
  onOpenChange,
  mode,
  client,
}: ClientFormDialogProps) => {
  const { addClient, updateClient, isLoading } = useClientStore();
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);

  useEffect(() => {
    if (mode === "edit" && client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company || "",
        document: client.document,
        address: client.address || {},
      });
    } else {
      setFormData(initialFormData);
    }
  }, [mode, client, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.document) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (mode === "edit" && client) {
        await updateClient(client.id, formData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await addClient(formData);
        toast.success("Cliente criado com sucesso!");
      }
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar cliente");
    }
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize as informações do cliente."
              : "Adicione as informações do novo cliente."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Nome
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" required>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" required>
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document" required>
                CPF/CNPJ
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Nome da empresa (opcional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={formData.address?.street || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                placeholder="Nome da rua"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.address?.city || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
                placeholder="Cidade"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {isEdit ? "Salvar Alterações" : "Criar Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
