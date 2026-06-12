import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarioMensal } from "@/components/posts/CalendarioMensal";
import { StatusBadge } from "@/components/posts/StatusBadge";
import { STATUS_LABELS } from "@/types";

async function getResumo() {
  const counts = await prisma.post.groupBy({ by: ["status"], _count: { _all: true } });
  const map: Record<string, number> = {};
  for (const c of counts) map[c.status] = c._count._all;
  return map;
}

async function getTodosPosts() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      titulo: true,
      pilar: true,
      status: true,
      dataAgendada: true,
      imagens: { select: { caminhoArquivo: true }, orderBy: { versao: "asc" }, take: 1 },
    },
    orderBy: [{ dataAgendada: "asc" }, { criadoEm: "desc" }],
  });

  return posts.map((p) => ({
    ...p,
    imagem: p.imagens[0]?.caminhoArquivo ?? null,
  }));
}

const STATUS_ORDER = ["RASCUNHO", "REVISAO", "APROVADO", "PUBLICADO"];

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [resumo, posts] = await Promise.all([getResumo(), getTodosPosts()]);
  const total = Object.values(resumo).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => {
          const qtd = resumo[status] ?? 0;
          const pct = total > 0 ? Math.round((qtd / total) * 100) : 0;
          return (
            <div key={status} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <StatusBadge status={status} />
                <span className="text-xs text-gray-400">{pct}%</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{qtd}</p>
              <p className="text-xs text-gray-500 mt-1">{STATUS_LABELS[status]}</p>
              <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendario */}
      <CalendarioMensal posts={posts} />
    </div>
  );
}
