const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('--- Iniciando migração de dados de Entrada de Caixa ---');
  const entradas = await prisma.entradaCaixa.findMany();
  console.log(`Encontradas ${entradas.length} entradas para verificação.`);

  for (const entrada of entradas) {
    const desc = (entrada.descricao || '').toUpperCase();
    const valorOriginal = Number(entrada.valor) || 0;

    let valorDinheiro = Number(entrada.valorDinheiro) || 0;
    let valorDebito = Number(entrada.valorDebito) || 0;
    let valorCredito = Number(entrada.valorCredito) || 0;
    let valorPix = Number(entrada.valorPix) || 0;
    let valorVoucher = Number(entrada.valorVoucher) || 0;

    // Se todos os campos novos estiverem zerados e houver valor original > 0, faz o backfill
    const somaAtual = valorDinheiro + valorDebito + valorCredito + valorPix + valorVoucher;
    if (somaAtual === 0 && valorOriginal > 0) {
      if (desc.includes('PIX')) {
        valorPix = valorOriginal;
      } else if (desc.includes('DINHEIRO')) {
        valorDinheiro = valorOriginal;
      } else if (desc.includes('DEBITO') || desc.includes('DÉBITO')) {
        valorDebito = valorOriginal;
      } else if (desc.includes('CREDITO') || desc.includes('CRÉDITO')) {
        valorCredito = valorOriginal;
      } else if (desc.includes('VOUCHER')) {
        valorVoucher = valorOriginal;
      } else {
        valorDinheiro = valorOriginal;
      }
    }

    const valorTotal = valorDinheiro + valorDebito + valorCredito + valorPix + valorVoucher;

    await prisma.entradaCaixa.update({
      where: { id: entrada.id },
      data: {
        valorDinheiro,
        valorDebito,
        valorCredito,
        valorPix,
        valorVoucher,
        valorTotal,
        valor: valorTotal,
      },
    });

    console.log(`Atualizada entrada ${entrada.id} (${entrada.descricao}): Total R$ ${valorTotal} [Dinheiro:${valorDinheiro}, Débito:${valorDebito}, Crédito:${valorCredito}, PIX:${valorPix}, Voucher:${valorVoucher}]`);
  }

  console.log('--- Migração concluída com sucesso! ---');
}

migrate()
  .catch((err) => {
    console.error('Erro na migração:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
