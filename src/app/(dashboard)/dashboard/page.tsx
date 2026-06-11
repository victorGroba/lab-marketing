import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CalendarioMensal } from "@/components/posts/CalendarioMensal";
import { StatusBadge } from "@/components/posts/StatusBadge";
import { STATUS_LABELS } from "@/types";

async function getResumo() {
  const counts = await prisma.post.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const c of counts) map[c.status] = c._count._all;
  return map;
}

async function getTodosPosts() {
  return prisma.post.findMany({
    select: {
      id: true,
      titulo: true,
      pilar: true,
      status: true,
      dataAgendada: true,
    },
    orderBy: [{ dataAgendada: "asc" }, { criadoEm: "desc" }],
  });
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
              {/* Barra de progresso */}
              <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda de pilares */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {[
          { label: "Educacao em Saude", cor: "bg-teal-400" },
          { label: "Qualidade",         cor: "bg-teal-600" },
          { label: "Institucional",     cor: "bg-gray-500" },
          { label: "Promocoes",         cor: "bg-yellow-500" },
          { label: "Resultados",        cor: "bg-green-500" },
        ].map((p) => (
          <span key={p.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${p.cor}`} />
            {p.label}
          </span>
        ))}
      </div>

      {/* Calendario */}
      <CalendarioMensal posts={posts} />
    </div>
  );
}
