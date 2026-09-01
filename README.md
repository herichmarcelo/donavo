# 🍲 Dona Vó Gestão — SaaS Financeiro para Restaurantes

Sistema de gestão financeira completo para restaurantes, desenvolvido especialmente com base na identidade visual e necessidades do restaurante **Dona Vó Comida Caseira**.

---

## 🚀 Tecnologias

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router & Server Actions)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + Design Tokens da marca
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) hospedado no [Supabase](https://supabase.com/) via [Prisma ORM](https://www.prisma.io/)
- **Autenticação**: [NextAuth.js](https://next-auth.js.org/) com JWT & integração Supabase Auth
- **Gráficos**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Tema**: Suporte completo a Modo Claro e Escuro (`next-themes`)
- **Exportação**: Relatórios em PDF (`jspdf` + `jspdf-autotable`) e CSV (`papaparse`)
- **Mobile First / PWA**: Manifest e Service Worker configurados

---

## 🎨 Identidade Visual (Paleta da Marca)

- **Terracota Principal**: `#A83A1F`
- **Terracota Escuro**: `#7A2A15`
- **Terracota Claro**: `#C45A3D`
- **Dourado / Mostarda**: `#D4A853`
- **Fundo Creme Claro**: `#FDF8F3`
- **Dark Mode**: `#1A1210` / `#2C1F1A`
- **Sucesso / Lucro**: `#4A7C59`

---

## 📦 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login e Criar Senha / Primeiro Acesso
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── page.tsx        # Dashboard com KPIs e gráficos de fluxo
│   │   ├── contas/         # Gestão de Contas a Pagar (CRUD, parcelas, filtros)
│   │   ├── caixa/          # Entradas manuais de caixa e vendas
│   │   ├── relatorios/     # Relatórios detalhados com exportação PDF/CSV
│   │   ├── usuarios/       # Controle de permissões (admin exclusivo)
│   │   └── configuracoes/  # Perfil, troca de senha e tema
│   └── api/                # Rotas seguras da API REST
├── components/
│   ├── ui/                 # Componentes reutilizáveis (botões, inputs, cards, modais)
│   ├── layout/             # Sidebar, Header, BottomNav (mobile)
│   ├── dashboard/          # Cards de KPI, Gráficos Recharts, Próximos Vencimentos
│   ├── contas/             # Formulários, listagem e pagamento de contas
│   └── caixa/              # Registro de entradas de caixa
└── lib/                    # Configurações do Prisma, Supabase, Auth e Utilitários
```

---

## ⚡ Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/herichmarcelo/donavo.git
cd donavo
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env.local` e preencha com as credenciais do Supabase:
```bash
cp .env.example .env.local
```

### 4. Sincronizar o banco de dados
```bash
npx prisma db push
```

### 5. Popular dados iniciais (Seed)
```bash
npm run prisma:seed
```

### 6. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🛡️ Credenciais Padrão (Demo)
- **E-mail**: `admin@donavo.com`
- **Senha**: `admin123`
