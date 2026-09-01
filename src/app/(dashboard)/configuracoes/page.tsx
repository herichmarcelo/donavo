"use client";

import * as React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Lock,
  Palette,
  Info,
  Key,
  Loader2,
  CheckCircle2,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { changePasswordSchema, ChangePasswordInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";

export default function ConfiguracoesPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [nome, setNome] = React.useState(session?.user?.nome || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  React.useEffect(() => {
    if (session?.user?.nome) {
      setNome(session.user.nome);
    }
  }, [session]);

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    formState: { errors: errorsPass },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    try {
      setIsUpdatingProfile(true);
      const res = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao atualizar perfil");

      await update({ nome });

      toast({
        variant: "success",
        title: "Perfil atualizado!",
        description: "Seu nome foi alterado com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordInput) => {
    try {
      setIsChangingPassword(true);
      const res = await fetch("/api/perfil/senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao trocar senha");

      toast({
        variant: "success",
        title: "Senha alterada!",
        description: "Sua nova senha já está ativa.",
      });

      resetPass();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: error.message,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
          Configurações
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gerencie seu perfil, segurança e preferências do sistema
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full space-y-5">
        <TabsList className="grid grid-cols-4 w-full h-auto p-1 gap-1 bg-muted/40 rounded-xl">
          <TabsTrigger
            value="perfil"
            className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium gap-1.5"
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Meu Perfil</span>
          </TabsTrigger>
          <TabsTrigger
            value="seguranca"
            className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger
            value="preferencias"
            className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium gap-1.5"
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger
            value="sobre"
            className="text-xs py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium gap-1.5"
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sobre</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Perfil */}
        <TabsContent value="perfil">
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-serif">
                Dados Pessoais
              </CardTitle>
              <CardDescription className="text-xs">
                Informações da sua conta de operador/gestor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={session?.user?.avatar || ""} />
                    <AvatarFallback className="text-lg font-bold">
                      {session?.user?.nome ? session.user.nome.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {session?.user?.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {session?.user?.cargo || "operador"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-xs font-semibold">
                    Nome de Exibição
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                    disabled={isUpdatingProfile}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    E-mail (Identificador único)
                  </Label>
                  <Input
                    id="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="h-11 rounded-xl text-sm bg-muted/50 opacity-80 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Para alterar o e-mail, solicite ao administrador.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="rounded-xl bg-primary hover:bg-brand-terracottaDark text-white px-6 font-semibold shadow-sm"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Atualizar Perfil"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Segurança (Troca de Senha) */}
        <TabsContent value="seguranca">
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-serif">
                Alterar Senha
              </CardTitle>
              <CardDescription className="text-xs">
                A nova senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um número.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPass(onSubmitPassword)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="senhaAtual" className="text-xs font-semibold">
                    Senha Atual
                  </Label>
                  <Input
                    id="senhaAtual"
                    type="password"
                    placeholder="••••••••"
                    className="h-11 rounded-xl text-sm"
                    disabled={isChangingPassword}
                    {...registerPass("senhaAtual")}
                  />
                  {errorsPass.senhaAtual && (
                    <p className="text-xs text-destructive">
                      {errorsPass.senhaAtual.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="novaSenha" className="text-xs font-semibold">
                    Nova Senha
                  </Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    placeholder="Mínimo 8 caracteres (A-Z e 0-9)"
                    className="h-11 rounded-xl text-sm"
                    disabled={isChangingPassword}
                    {...registerPass("novaSenha")}
                  />
                  {errorsPass.novaSenha && (
                    <p className="text-xs text-destructive">
                      {errorsPass.novaSenha.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmarNovaSenha" className="text-xs font-semibold">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmarNovaSenha"
                    type="password"
                    placeholder="Repita a nova senha"
                    className="h-11 rounded-xl text-sm"
                    disabled={isChangingPassword}
                    {...registerPass("confirmarNovaSenha")}
                  />
                  {errorsPass.confirmarNovaSenha && (
                    <p className="text-xs text-destructive">
                      {errorsPass.confirmarNovaSenha.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="rounded-xl bg-primary hover:bg-brand-terracottaDark text-white px-6 font-semibold shadow-sm"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      "Salvar Nova Senha"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Preferências & Tema */}
        <TabsContent value="preferencias">
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-serif">
                Aparência e Formatação
              </CardTitle>
              <CardDescription className="text-xs">
                Personalize o visual e padrões regionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    Modo Visual
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Alternar entre tema Claro (Off-white aconchegante) e Escuro (Marrom chocolate)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="rounded-xl gap-1.5"
                  >
                    <Sun className="h-4 w-4" />
                    Claro
                  </Button>
                  <Button
                    type="button"
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="rounded-xl gap-1.5"
                  >
                    <Moon className="h-4 w-4" />
                    Escuro
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-1 text-xs">
                <p className="font-semibold text-foreground">
                  Padrões do Sistema
                </p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                  <div>Moeda: <strong className="text-foreground">Real Brasileiro (R$ BRL)</strong></div>
                  <div>Formato de Data: <strong className="text-foreground">DD/MM/AAAA</strong></div>
                  <div>Fuso Horário: <strong className="text-foreground">America/Campo_Grande / Brasília</strong></div>
                  <div>Idioma: <strong className="text-foreground">Português (Brasil)</strong></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Sobre */}
        <TabsContent value="sobre">
          <Card className="rounded-2xl border-border shadow-xs text-center p-6 space-y-4">
            <div className="relative h-20 w-20 mx-auto rounded-2xl overflow-hidden border-2 border-brand-gold/50 shadow-md bg-white p-1">
              <Image
                src="/logo-donavo.png"
                alt="Logo Dona Vó"
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-primary">
                Dona Vó Gestão
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Versão 1.0.0 (Mobile-First Edition)
              </p>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Desenvolvido com excelência para a gestão financeira, controle de fornecedores, contas a pagar e entradas diárias do restaurante Dona Vó Comida Caseira.
            </p>
            <div className="pt-2 text-[11px] text-muted-foreground/70">
              © {new Date().getFullYear()} Dona Vó Comida Caseira. Todos os direitos reservados.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
