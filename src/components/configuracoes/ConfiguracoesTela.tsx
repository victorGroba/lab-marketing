"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { criarUsuarioAction, alterarSenhaAction, excluirUsuarioAction } from "@/app/(dashboard)/configuracoes/actions";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  criadoEm: Date;
};

export function ConfiguracoesTela({
  usuarios,
  sessaoId,
  sessaoPapel,
}: {
  usuarios: Usuario[];
  sessaoId: string;
  sessaoPapel: string;
}) {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"usuarios" | "senha">("usuarios");
  const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false);
  const [usuarioSenha, setUsuarioSenha] = useState<Usuario | null>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [pending, startTransition] = useTransition();

  const ehTI = sessaoPapel === "TI";

  function feedback(msg: string) {
    setMensagem(msg);
    setTimeout(() => setMensagem(""), 3000);
  }

  async function handleCriarUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await criarUsuarioAction(fd);
      if (r.erro) { setErro(r.erro); return; }
      feedback("Usuario criado com sucesso.");
      setMostrarFormUsuario(false);
      router.refresh();
    });
  }

  async function handleAlterarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await alterarSenhaAction(fd);
      if (r.erro) { setErro(r.erro); return; }
      feedback("Senha alterada com sucesso.");
      setUsuarioSenha(null);
      router.refresh();
    });
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Excluir o usuario "${nome}"? Esta acao nao pode ser desfeita.`)) return;
    startTransition(async () => {
      const r = await excluirUsuarioAction(id);
      if (r.erro) { setErro(r.erro); return; }
      feedback("Usuario excluido.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {mensagem && (
        <div className="bg-teal-50 border border-teal-100 text-teal-700 text-sm px-4 py-3 rounded-xl">
          {mensagem}
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Usuarios</h2>
          {ehTI && (
            <button
              onClick={() => { setMostrarFormUsuario(true); setErro(""); }}
              className="btn-primary text-xs"
            >
              + Novo usuario
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {usuarios.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm flex-shrink-0">
                {u.nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{u.nome}</p>
                  {u.id === sessaoId && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">voce</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.papel === "TI" ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {u.papel === "TI" ? "TI" : "Diretor"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <p className="text-xs text-gray-300 hidden sm:block">
                desde {format(new Date(u.criadoEm), "MMM yyyy", { locale: ptBR })}
              </p>
              <div className="flex gap-2">
                {(ehTI || u.id === sessaoId) && (
                  <button
                    onClick={() => { setUsuarioSenha(u); setErro(""); }}
                    className="text-xs text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    Alterar senha
                  </button>
                )}
                {ehTI && u.id !== sessaoId && (
                  <button
                    onClick={() => handleExcluir(u.id, u.nome)}
                    disabled={pending}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal novo usuario */}
      {mostrarFormUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Novo usuario</h2>
              <button onClick={() => setMostrarFormUsuario(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCriarUsuario} className="space-y-4">
              <div>
                <label className="label">Nome *</label>
                <input name="nome" required className="input" placeholder="Nome completo" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input name="email" type="email" required className="input" placeholder="email@laboratorio.com" />
              </div>
              <div>
                <label className="label">Senha *</label>
                <input name="senha" type="password" required className="input" placeholder="Minimo 6 caracteres" />
              </div>
              <div>
                <label className="label">Papel *</label>
                <select name="papel" required className="input">
                  <option value="TI">TI</option>
                  <option value="DIRETOR">Diretor Financeiro</option>
                </select>
              </div>
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMostrarFormUsuario(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={pending} className="btn-primary flex-1">{pending ? "Criando..." : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal alterar senha */}
      {usuarioSenha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Alterar senha</h2>
              <button onClick={() => setUsuarioSenha(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Alterando senha de <span className="font-medium text-gray-900">{usuarioSenha.nome}</span></p>
            <form onSubmit={handleAlterarSenha} className="space-y-4">
              <input type="hidden" name="userId" value={usuarioSenha.id} />
              <div>
                <label className="label">Nova senha *</label>
                <input name="novaSenha" type="password" required className="input" placeholder="Minimo 6 caracteres" />
              </div>
              {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setUsuarioSenha(null)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={pending} className="btn-primary flex-1">{pending ? "Salvando..." : "Salvar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
