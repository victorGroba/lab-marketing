import { PrismaClient, Papel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Criando usuarios...");

  const senhaHash = await bcrypt.hash("lab@2025", 12);

  const ti = await prisma.user.upsert({
    where: { email: "ti@laboratorio.com" },
    update: {},
    create: {
      nome: "Equipe TI",
      email: "ti@laboratorio.com",
      senhaHash,
      papel: Papel.TI,
    },
  });

  await prisma.user.upsert({
    where: { email: "diretor@laboratorio.com" },
    update: {},
    create: {
      nome: "Diretor Financeiro",
      email: "diretor@laboratorio.com",
      senhaHash,
      papel: Papel.DIRETOR,
    },
  });

  console.log("Seed concluido: 2 usuarios criados.");
  console.log("  ti@laboratorio.com  /  lab@2025");
  console.log("  diretor@laboratorio.com  /  lab@2025");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
