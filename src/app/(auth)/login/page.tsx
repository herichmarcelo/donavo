"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Mail,
  Loader2,
  Sparkles,
  UserPlus,
  LogIn,
  User as UserIcon,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import {
  loginSchema,
  LoginInput,
  registerSchema,
  RegisterInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = React.useState(false);

  // Form de Login
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setValue: setValueLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  // Form de Cadastro / Criar Senha
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    reset: resetSignup,
    formState: { errors: errorsSignup },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const onLoginSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        senha: data.senha,
        redirect: false,
      });

      if (res?.error) {
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: res.error,
        });
        return;
      }

      toast({
        variant: "success",
        title: "Bem-vindo(a)!",
        description: "Login realizado com sucesso.",
      });

      router.push("/");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar o login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro ao cadastrar senha");
      }

      toast({
        variant: "success",
        title: "Senha criada com sucesso!",
        description: "Conectando você ao sistema...",
      });

      // Login automático logo após o cadastro
      const loginRes = await signIn("credentials", {
        email: data.email.toLowerCase().trim(),
        senha: data.senha,
        redirect: false,
      });

      if (!loginRes?.error) {
        router.push("/");
        router.refresh();
      } else {
        setActiveTab("login");
        setValueLogin("email", data.email);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível criar a conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setValueLogin("email", "admin@donavo.com");
    setValueLogin("senha", "admin123");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-8 relative selection:bg-brand-gold/30">
      {/* Theme Toggle Top-Right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-5 animate-fade-in">
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-brand-gold/50 shadow-md bg-white p-1">
            <Image
              src="/logo-donavo.png"
              alt="Dona Vó Comida Caseira"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary tracking-tight">
              Dona Vó Gestão
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Controle financeiro simples e eficiente para seu restaurante
            </p>
          </div>
        </div>

        {/* Card com Abas: Entrar vs Criar Senha */}
        <Card className="border-border shadow-lg bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(val: any) => setActiveTab(val)}
            className="w-full"
          >
            <div className="p-3 bg-muted/40 border-b border-border">
              <TabsList className="grid grid-cols-2 w-full h-11 p-1 bg-background/80 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-white gap-1.5"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Criar Senha</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ABA 1: LOGIN */}
            <TabsContent value="login" className="m-0 p-6 pt-4 space-y-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">
                  Acessar Sistema
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Informe seu e-mail e senha para continuar
                </p>
              </div>

              <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-semibold">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seuemail@donavo.com"
                      className="pl-10 h-11 text-sm rounded-xl"
                      autoComplete="email"
                      disabled={isLoading}
                      {...registerLogin("email")}
                    />
                  </div>
                  {errorsLogin.email && (
                    <p className="text-xs text-destructive font-medium">
                      {errorsLogin.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-senha" className="text-xs font-semibold">
                      Senha
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-senha"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 text-sm rounded-xl"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...registerLogin("senha")}
                    />
                  </div>
                  {errorsLogin.senha && (
                    <p className="text-xs text-destructive font-medium">
                      {errorsLogin.senha.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold rounded-xl bg-primary hover:bg-brand-terracottaDark shadow-md shadow-primary/20 text-white mt-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar no Sistema"
                  )}
                </Button>
              </form>

              {/* Botão de Preenchimento Rápido */}
              <div className="mt-4 pt-3 border-t border-border text-center">
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1 px-2.5 rounded-lg border border-dashed border-border hover:border-primary/40 bg-muted/30"
                >
                  <Sparkles className="h-3.5 w-3.5 text-secondary" />
                  <span>Preencher credenciais demo (admin)</span>
                </button>
              </div>
            </TabsContent>

            {/* ABA 2: CRIAR SENHA / PRIMEIRO ACESSO */}
            <TabsContent value="register" className="m-0 p-6 pt-4 space-y-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">
                  Criar Nova Senha
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cadastre seus dados e crie uma senha de acesso
                </p>
              </div>

              <form onSubmit={handleSubmitSignup(onRegisterSubmit)} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-nome" className="text-xs font-semibold">
                    Seu Nome Completo
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-nome"
                      placeholder="Ex: Thales ou Maria"
                      className="pl-10 h-11 text-sm rounded-xl"
                      disabled={isLoading}
                      {...registerSignup("nome")}
                    />
                  </div>
                  {errorsSignup.nome && (
                    <p className="text-xs text-destructive font-medium">
                      {errorsSignup.nome.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-xs font-semibold">
                    Seu E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seuemail@donavo.com"
                      className="pl-10 h-11 text-sm rounded-xl"
                      disabled={isLoading}
                      {...registerSignup("email")}
                    />
                  </div>
                  {errorsSignup.email && (
                    <p className="text-xs text-destructive font-medium">
                      {errorsSignup.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-senha" className="text-xs font-semibold">
                    Criar Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-senha"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 h-11 text-sm rounded-xl"
                      disabled={isLoading}
                      {...registerSignup("senha")}
                    />
                  </div>
                  {errorsSignup.senha && (
                    <p className="text-xs text-destructive font-medium">
                      {errorsSignup.senha.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirmar" className="text-xs font-semibold">
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-confirmar"
                      type="password"
                      placeholder="Repita a senha criada"
                      className="pl-10 h-11 text-sm rounded-xl"
                      disabled={isLoading}
                      {...registerSignup("confirmarSenha")}
                    />
                  </div>
                  {errorsSignup.confirmarSenha && (
                    <p className="text-xs text-destructive font-medium">
                      {errorsSignup.confirmarSenha.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-sm font-semibold rounded-xl bg-success hover:bg-success/90 shadow-md shadow-success/20 text-white mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando Senha...
                    </>
                  ) : (
                    "Cadastrar e Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Rodapé */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dona Vó Comida Caseira. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
