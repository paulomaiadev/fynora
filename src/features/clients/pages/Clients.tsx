import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Building2 } from "lucide-react";
import { useClientStore } from "@/store/clientStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ClientFormDialog } from "../components/ClientFormDialog";
import { toast } from "sonner";
import type { Client } from "@/types";

const Clients = () => {
  const { clients, searchTerm, setSearchTerm, deleteClient } = useClientStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term) ||
        client.document.includes(term)
    );
  }, [clients, searchTerm]);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsEditOpen(true);
  };

  const handleDeleteConfirm = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (selectedClient) {
      await deleteClient(selectedClient.id);
      toast.success("Cliente excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedClient(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <PageHeader
        title="Clientes"
        description="Gerencie sua base de clientes"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes..."
            className="pl-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Building2}
                    title="Nenhum cliente encontrado"
                    description={searchTerm ? "Tente buscar por outro termo" : "Adicione seu primeiro cliente"}
                    action={
                      !searchTerm && (
                        <Button onClick={() => setIsCreateOpen(true)} size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Novo Cliente
                        </Button>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group border-b border-border/50 transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-semibold">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">{client.email}</TableCell>
                  <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{client.company || "-"}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {client.document}
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
                          <Link to={`/clients/${client.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteConfirm(client)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Create Dialog */}
      <ClientFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      <ClientFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        client={selectedClient}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o cliente "${selectedClient?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </motion.div>
  );
};

export default Clients;
