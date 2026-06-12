"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { atualizarPostAction, avancarStatusAction, voltarStatusAction } from "@/app/(dashboard)/posts/[id]/actions";
import { StatusBadge } from "./StatusBadge";
import { STATUS_FLOW_LABELS, STATUS_FLOW, PILARES } from "@/types";

type PostCompleto = {
  id: string;
  titulo: string;
  pilar: string;
  baseNormativa: string | null;
  textoArte: string | null;
  legenda: string | null;
  hashtags: string | null;
  promptImagem: string | null;
  status: string;
  dataAgendada: Date | null;
  criadoPor: { nome: string };
};

export function PostEditor({ post }: { post: PostCompleto }) {
  const router = useRouter();
  const [salvando, startSalvar] = useTransition();
  const [avancando, startAvancar] = useTransition();
  const [voltando, startVoltar] = useTransition();
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const proximoStatus = STATUS_FLOW[post.status];
  const labelAvancar = STATUS_FLOW_LABELS[post.status];

  function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");
    setErro("");
    const fd = new FormData(e.currentTarget);

    startSalvar(async () => {
      const result = await atualizarPostAction(post.id, fd);
      if (result.erro) { setErro(result.erro); return; }
      setMensagem("Salvo com sucesso.");
      setTimeout(() => setMensagem(""), 3000);
      router.refresh();
    });
  }

  function avancar() {
    setErro("");
    startAvancar(async () => {
      const result = await avancarStatusAction(post.id);
      if (result.erro) setErro(result.erro);
      else router.refresh();
    });
  }

  function voltar() {
    setErro("");
    startVoltar(async () => {
      const result = await voltarStatusAction(post.id);
      if (result.erro) setErro(result.erro);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      {/* Status + acoes */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={post.status} />

        {post.status !== "RASCUNHO" && (
          <button
            type="button"
            onClick={voltar}
            disabled={voltando}
            className="btn-secondary text-sm"
          >
            {voltando ? "Voltando..." : "Voltar status"}
          </button>
        )}

        {proximoStatus && (
          <button
            type="button"
            onClick={avancar}
            disabled={avancando}
            className="btn-primary text-sm"
          >
            {avancando ? "Aguarde..." : labelAvancar}
          </button>
        )}

        {post.status === "PUBLICADO" && (
          <span className="text-xs text-gray-400">Post publicado. Edicao ainda disponivel para registro.</span>
        )}
      </div>

      {erro && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>
      )}

      {/* Campos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:col-span-2">
          <label className="label">Titulo *</label>
          <input name="titulo" defaultValue={post.titulo} required className="input" />
        </div>

        <div>
          <label className="label">Pilar *</label>
          <select name="pilar" defaultValue={post.pilar} required className="input">
            {PILARES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Data agendada</label>
          <input
            name="dataAgendada"
            type="date"
            defaultValue={post.dataAgendada ? format(new Date(post.dataAgendada), "yyyy-MM-dd") : ""}
            className="input"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="label">Base normativa</label>
          <input name="baseNormativa" defaultValue={post.baseNormativa ?? ""} className="input" placeholder="Ex: RDC 786/2023" />
        </div>

        <div className="lg:col-span-2">
          <label className="label">Texto da arte</label>
          <textarea name="textoArte" defaultValue={post.textoArte ?? ""} rows={3} className="input resize-none" placeholder="Texto que aparece na imagem do post" />
        </div>

        <div className="lg:col-span-2">
          <label className="label">Legenda</label>
          <textarea name="legenda" defaultValue={post.legenda ?? ""} rows={5} className="input resize-none" placeholder="Legenda completa do post no Instagram" />
        </div>

        <div className="lg:col-span-2">
          <label className="label">Hashtags</label>
          <input name="hashtags" defaultValue={post.hashtags ?? ""} className="input" placeholder="#laboratorio #saude ..." />
        </div>

        <div className="lg:col-span-2">
          <label className="label">Prompt de imagem</label>
          <textarea name="promptImagem" defaultValue={post.promptImagem ?? ""} rows={3} className="input resize-none" placeholder="Descricao para gerar a imagem com IA" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Criado por {post.criadoPor.nome}</span>
        <div className="flex items-center gap-3">
          {mensagem && <span className="text-sm text-teal-600">{mensagem}</span>}
          <button type="submit" disabled={salvando} className="btn-primary">
            {salvando ? "Salvando..." : "Salvar alteracoes"}
          </button>
        </div>
      </div>
    </form>
  );
}
