import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
  } else {
    console.log("Usuário admin já existia.");
  }

  console.log("Seed finalizado com sucesso! Apenas o usuário administrador está configurado.");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
