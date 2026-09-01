"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Iniciando seed do banco de dados Dona Vó Gestão...");
    // 1. Criar Usuário Admin
    const adminEmail = "admin@donavo.com";
    const existingAdmin = await prisma.usuario.findUnique({
        where: { email: adminEmail },
    });
    let adminUser = existingAdmin;
    if (!existingAdmin) {
        const hashedSenha = await bcrypt.hash("admin123", 10);
        adminUser = await prisma.usuario.create({
            data: {
                nome: "Dona Vó Admin",
                email: adminEmail,
                senha: hashedSenha,
                cargo: "admin",
                ativo: true,
            },
        });
        console.log("Usuário admin criado: admin@donavo.com / admin123");
    }
    else {
        console.log("Usuário admin já existia.");
    }
    // 2. Limpar dados anteriores de contas e caixa para seed consistente
    await prisma.conta.deleteMany({});
    await prisma.entradaCaixa.deleteMany({});
    const userId = adminUser.id;
    // 3. Contas do período de Julho 2026 (baseado no Excel do Restaurante)
    const contasJulho = [
        {
            fornecedor: "Climatizar (Edgar)",
            valor: 540.95,
            discriminacao: "Conserto e Manutenção Ar Condicionado",
            dataVencimento: new Date(2026, 6, 5),
            dataPagamento: new Date(2026, 6, 5),
            valorPago: 540.95,
            status: "PAGA",
            categoria: "CUSTEIO",
            observacao: "Parcela 1/6 recorrente",
        },
        {
            fornecedor: "MP Refricenterse (Luciene)",
            valor: 400.0,
            discriminacao: "Cervejeiro / Manutenção Geladeiras",
            dataVencimento: new Date(2026, 6, 8),
            dataPagamento: new Date(2026, 6, 8),
            valorPago: 400.0,
            status: "PAGA",
            categoria: "INVESTIMENTO",
        },
        {
            fornecedor: "R Center Outlet (Luciene)",
            valor: 400.08,
            discriminacao: "Balcão Expositor Térmico",
            dataVencimento: new Date(2026, 6, 10),
            dataPagamento: new Date(2026, 6, 10),
            valorPago: 400.08,
            status: "PAGA",
            categoria: "INVESTIMENTO",
        },
        {
            fornecedor: "Supergasbras",
            valor: 114.9,
            discriminacao: "Botijão de Gás P45 Cozinha",
            dataVencimento: new Date(2026, 6, 12),
            dataPagamento: new Date(2026, 6, 12),
            valorPago: 114.9,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Edilberto Vigano",
            valor: 1532.0,
            discriminacao: "Aluguel Ponto Comercial Restaurante",
            dataVencimento: new Date(2026, 6, 10),
            dataPagamento: new Date(2026, 6, 10),
            valorPago: 1532.0,
            status: "PAGA",
            categoria: "CUSTEIO",
            observacao: "Pago via transferência bancária",
        },
        {
            fornecedor: "Assai Atacadista",
            valor: 4320.5,
            discriminacao: "Arroz, Feijão, Óleo, Farinhas e Grãos",
            dataVencimento: new Date(2026, 6, 6),
            dataPagamento: new Date(2026, 6, 6),
            valorPago: 4320.5,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Aliança Carnes",
            valor: 5120.0,
            discriminacao: "Carnes Bovinas, Frango e Cortes Caseiros",
            dataVencimento: new Date(2026, 6, 15),
            dataPagamento: new Date(2026, 6, 15),
            valorPago: 5120.0,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Bom Preço Hortifruti",
            valor: 1350.0,
            discriminacao: "Hortaliças, Folhas, Tomate, Cebola e Batatas",
            dataVencimento: new Date(2026, 6, 14),
            dataPagamento: new Date(2026, 6, 14),
            valorPago: 1350.0,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Supermercado Pires",
            valor: 1180.4,
            discriminacao: "Laticínios, Queijos, Molhos e Temperos",
            dataVencimento: new Date(2026, 6, 18),
            dataPagamento: new Date(2026, 6, 18),
            valorPago: 1180.4,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Fort Atacadista",
            valor: 920.25,
            discriminacao: "Produtos de Limpeza Pesada, Cloro e Detergente",
            dataVencimento: new Date(2026, 6, 20),
            dataPagamento: new Date(2026, 6, 20),
            valorPago: 920.25,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Casa do Porco",
            valor: 1680.0,
            discriminacao: "Costelinha de Porco, Bacon e Linguiça Artesanal",
            dataVencimento: new Date(2026, 6, 22),
            dataPagamento: new Date(2026, 6, 22),
            valorPago: 1680.0,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Stephany dos Santos",
            valor: 890.0,
            discriminacao: "Embalagens de Marmitex e Sacolas Delivery",
            dataVencimento: new Date(2026, 6, 23),
            dataPagamento: new Date(2026, 6, 23),
            valorPago: 890.0,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Juan Gabriel (PDV)",
            valor: 250.0,
            discriminacao: "Mensalidade Software de Frente de Caixa PDV",
            dataVencimento: new Date(2026, 6, 25),
            dataPagamento: new Date(2026, 6, 25),
            valorPago: 250.0,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Vivo/Telefônica",
            valor: 189.9,
            discriminacao: "Internet Fibra e Linha Telefônica",
            dataVencimento: new Date(2026, 6, 25),
            dataPagamento: new Date(2026, 6, 25),
            valorPago: 189.9,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Energia Elétrica (Concessionária)",
            valor: 2789.68,
            discriminacao: "Conta de Luz Mês de Junho/Julho",
            dataVencimento: new Date(2026, 6, 26),
            dataPagamento: new Date(2026, 6, 26),
            valorPago: 2789.68,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Água e Esgoto (Saneamento)",
            valor: 790.0,
            discriminacao: "Consumo de Água Restaurante",
            dataVencimento: new Date(2026, 6, 27),
            dataPagamento: new Date(2026, 6, 27),
            valorPago: 790.0,
            status: "PAGA",
            categoria: "CUSTEIO",
        },
        // Contas Pendentes do fim do mês / Próximos dias
        {
            fornecedor: "Aliança Carnes",
            valor: 2850.0,
            discriminacao: "Pedido Semanal Carnes e Churrasco",
            dataVencimento: new Date(2026, 6, 28),
            status: "PENDENTE",
            categoria: "CUSTEIO",
            observacao: "Boleto aguardando liberação",
        },
        {
            fornecedor: "Frutaria da Julio",
            valor: 740.0,
            discriminacao: "Frutas para Sobremesas e Sucos Naturais",
            dataVencimento: new Date(2026, 6, 29),
            status: "PENDENTE",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Facebook/Instagram Ads",
            valor: 450.0,
            discriminacao: "Anúncios Meta Ads Delivery e Almoço",
            dataVencimento: new Date(2026, 6, 30),
            status: "PENDENTE",
            categoria: "OUTRAS",
        },
        {
            fornecedor: "Google Ads",
            valor: 350.0,
            discriminacao: "Anúncios Busca 'Restaurante Comida Caseira'",
            dataVencimento: new Date(2026, 6, 30),
            status: "PENDENTE",
            categoria: "OUTRAS",
        },
        {
            fornecedor: "Manutenção Coifa e Fogão",
            valor: 496.84,
            discriminacao: "Limpeza de Dutos e Troca de Queimadores",
            dataVencimento: new Date(2026, 6, 31),
            status: "PENDENTE",
            categoria: "CUSTEIO",
        },
        {
            fornecedor: "Assai Atacadista",
            valor: 3000.0,
            discriminacao: "Reposição de Estoque Fim de Mês",
            dataVencimento: new Date(2026, 6, 31),
            status: "PENDENTE",
            categoria: "CUSTEIO",
        },
    ];
    for (const c of contasJulho) {
        await prisma.conta.create({
            data: {
                fornecedor: c.fornecedor,
                valor: c.valor,
                discriminacao: c.discriminacao,
                dataVencimento: c.dataVencimento,
                dataPagamento: c.dataPagamento || null,
                valorPago: c.valorPago || null,
                status: c.status,
                categoria: c.categoria,
                observacao: c.observacao || null,
                usuarioId: userId,
            },
        });
    }
    console.log(`${contasJulho.length} contas de Julho/2026 inseridas com sucesso!`);
    // 4. Entradas de Caixa
    const entradas = [
        {
            descricao: "Vendas Almoço Balcão e Buffet (Semana 1)",
            valor: 9450.0,
            dataEntrada: new Date(2026, 6, 7),
            tipo: "VENDA",
            observacao: "Dinheiro e PIX balcão",
        },
        {
            descricao: "Vendas Almoço Balcão e Buffet (Semana 2)",
            valor: 11200.0,
            dataEntrada: new Date(2026, 6, 14),
            tipo: "VENDA",
        },
        {
            descricao: "Vendas Delivery e Marmitex (Semana 3)",
            valor: 8900.0,
            dataEntrada: new Date(2026, 6, 21),
            tipo: "VENDA",
        },
        {
            descricao: "Aporte de Caixa Reserva Sócios",
            valor: 3500.0,
            dataEntrada: new Date(2026, 6, 2),
            tipo: "MANUAL",
            observacao: "Fundo de giro inicial do mês",
        },
        {
            descricao: "Vendas Balcão Almoço Hoje",
            valor: 1850.0,
            dataEntrada: new Date(),
            tipo: "VENDA",
        },
    ];
    for (const e of entradas) {
        await prisma.entradaCaixa.create({
            data: {
                descricao: e.descricao,
                valor: e.valor,
                dataEntrada: e.dataEntrada,
                tipo: e.tipo,
                observacao: e.observacao || null,
                usuarioId: userId,
            },
        });
    }
    console.log(`${entradas.length} entradas de caixa inseridas com sucesso!`);
    console.log("Seed finalizado com sucesso!");
}
main()
    .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
