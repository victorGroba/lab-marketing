import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfiguracoesTela } from "@/components/configuracoes/ConfiguracoesTela";

export default async function ConfiguracoesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const usuarios = await prisma.user.findMany({
    select: { id: true, nome: true, email: true, papel: true, criadoEm: true },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Configuracoes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gerenciamento de usuarios do sistema</p>
      </div>
      <ConfiguracoesTela
        usuarios={usuarios}
        sessaoId={session.user.id}
        sessaoPapel={session.user.papel}
      />
    </div>
  );
}
