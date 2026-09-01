"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  Plus,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Key,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { usuarioSchema, UsuarioInput } from "@/lib/validations/usuario";
import { formatDateTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

export default function UsuariosPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [usuarios, setUsuarios] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UsuarioInput>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      cargo: "operador",
      ativo: true,
    },
  });

  const cargo = watch("cargo");
  const ativo = watch("ativo");

  const fetchUsuarios = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    reset({
      nome: "",
      email: "",
      senha: "",
      cargo: "operador",
      ativo: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    reset({
      nome: user.nome,
      email: user.email,
      senha: "", // Não preenche senha na edição
      cargo: user.cargo as any,
      ativo: user.ativo,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: UsuarioInput) => {
    try {
      setIsSubmitting(true);
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : "/api/usuarios";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro ao salvar usuário");
      }

      toast({
        variant: "success",
        title: editingUser ? "Usuário atualizado" : "Usuário cadastrado",
        description: `O acesso de ${data.nome} foi configurado com sucesso.`,
      });

      setModalOpen(false);
      fetchUsuarios();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar os dados.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/usuarios/${userToDelete}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Erro ao excluir usuário");

      toast({
        variant: "success",
        title: "Usuário removido",
        description: "O usuário foi excluído do sistema.",
      });

      setUserToDelete(null);
      fetchUsuarios();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o usuário.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Gerenciamento de Usuários
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Controle de acessos e papéis (Admin, Operador, Caixa)
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-xl bg-primary hover:bg-brand-terracottaDark text-white h-10 text-xs font-semibold gap-1.5 shadow-md shadow-primary/20 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Usuário</span>
        </Button>
      </div>

      {/* Tabela de Usuários */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs text-muted-foreground">
                Nenhum usuário cadastrado além do administrador.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {usuarios.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {u.nome}
                        </p>
                        {u.ativo ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Ativo" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" title="Inativo" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Último acesso: {u.ultimoAcesso ? formatDateTime(u.ultimoAcesso) : "Nunca"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        u.cargo === "admin"
                          ? "default"
                          : u.cargo === "caixa"
                          ? "success"
                          : "secondary"
                      }
                      className="uppercase text-[10px]"
                    >
                      {u.cargo}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(u)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {u.id !== session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUserToDelete(u.id)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Criar / Editar Usuário */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuário" : "Cadastrar Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              Defina as permissões de acesso ao sistema
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-xs font-semibold">
                Nome Completo *
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome"
                  placeholder="Ex: Maria da Silva"
                  className="pl-10 h-11 rounded-xl text-sm"
                  disabled={isSubmitting}
                  {...register("nome")}
                />
              </div>
              {errors.nome && (
                <p className="text-xs text-destructive">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                E-mail de Acesso *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@donavo.com"
                  className="pl-10 h-11 rounded-xl text-sm"
                  disabled={isSubmitting}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-xs font-semibold">
                {editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha Provisória *"}
              </Label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder={editingUser ? "••••••••" : "Mínimo 6 caracteres"}
                  className="pl-10 h-11 rounded-xl text-sm"
                  disabled={isSubmitting}
                  {...register("senha")}
                />
              </div>
              {errors.senha && (
                <p className="text-xs text-destructive">{errors.senha.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cargo" className="text-xs font-semibold">
                Papel / Permissão *
              </Label>
              <Select
                value={cargo}
                onValueChange={(val: any) =>
                  setValue("cargo", val, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operador">
                    Operador (Contas a pagar e relatórios)
                  </SelectItem>
                  <SelectItem value="caixa">
                    Caixa (Entradas e consultas)
                  </SelectItem>
                  <SelectItem value="admin">
                    Administrador (Acesso total + usuários)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Usuário Ativo
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Desative para bloquear o login temporariamente
                </p>
              </div>
              <Switch
                checked={ativo}
                onCheckedChange={(val) => setValue("ativo", val)}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-primary hover:bg-brand-terracottaDark text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingUser ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Usuário"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão de Usuário */}
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este usuário do sistema?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl font-semibold"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
