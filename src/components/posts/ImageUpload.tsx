"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";

type Imagem = {
  id: string;
  caminhoArquivo: string;
  versao: number;
  enviadoEm: Date;
};

type UploadState =
  | { status: "idle" }
  | { status: "reading"; fileName: string }
  | { status: "uploading"; fileName: string; preview: string; progress: number }
  | { status: "success"; fileName: string }
  | { status: "error"; message: string };

export function ImageUpload({ postId, imagens }: { postId: string; imagens: Imagem[] }) {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });

  const onDrop = useCallback(
    async (arquivos: File[]) => {
      const arquivo = arquivos[0];
      if (!arquivo) return;

      setUploadState({ status: "reading", fileName: arquivo.name });

      // Gera preview local
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(arquivo);
      });

      setUploadState({ status: "uploading", fileName: arquivo.name, preview, progress: 0 });

      // Simula progresso enquanto faz upload real via XHR (com progresso real)
      await new Promise<void>((resolve, reject) => {
        const fd = new FormData();
        fd.append("arquivo", arquivo);
        fd.append("postId", postId);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 90); // até 90% no upload
            setUploadState((prev) =>
              prev.status === "uploading" ? { ...prev, progress: pct } : prev
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadState((prev) =>
              prev.status === "uploading" ? { ...prev, progress: 100 } : prev
            );
            resolve();
          } else {
            try {
              const json = JSON.parse(xhr.responseText);
              reject(new Error(json.erro ?? "Erro ao enviar"));
            } catch {
              reject(new Error("Erro ao enviar"));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Falha na conexao")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelado")));

        xhr.open("POST", "/api/uploads");
        xhr.send(fd);
      }).then(() => {
        setUploadState({ status: "success", fileName: arquivo.name });
        setTimeout(() => {
          setUploadState({ status: "idle" });
          router.refresh();
        }, 1200);
      }).catch((err: Error) => {
        setUploadState({ status: "error", message: err.message });
        setTimeout(() => setUploadState({ status: "idle" }), 3000);
      });
    },
    [postId, router]
  );

  const isDisabled =
    uploadState.status === "reading" ||
    uploadState.status === "uploading" ||
    uploadState.status === "success";

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: isDisabled,
  });

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
          isDragActive
            ? "border-teal-400 bg-teal-50"
            : uploadState.status === "error"
            ? "border-red-300 bg-red-50"
            : uploadState.status === "success"
            ? "border-teal-400 bg-teal-50"
            : isDisabled
            ? "border-teal-300 bg-gray-50"
            : "border-gray-200 hover:border-teal-300 hover:bg-gray-50 cursor-pointer"
        }`}
      >
        <input {...getInputProps()} />

        {/* === ESTADO: LENDO ARQUIVO === */}
        {uploadState.status === "reading" && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Preparando {uploadState.fileName}…</p>
          </div>
        )}

        {/* === ESTADO: FAZENDO UPLOAD === */}
        {uploadState.status === "uploading" && (
          <div className="relative">
            {/* Imagem de fundo com blur */}
            <img
              src={uploadState.preview}
              alt="preview"
              className="w-full max-h-48 object-cover opacity-40"
            />
            {/* Overlay de progresso */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60 px-8">
              <p className="text-sm font-medium text-gray-700 truncate max-w-full">
                {uploadState.fileName}
              </p>
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
              <p className="text-xs text-teal-600 font-semibold">
                {uploadState.progress < 100 ? `${uploadState.progress}%` : "Finalizando…"}
              </p>
            </div>
          </div>
        )}

        {/* === ESTADO: SUCESSO === */}
        {uploadState.status === "success" && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className="w-10 h-10 rounded-full bg-teal-400 flex items-center justify-center animate-[scale-in_0.2s_ease-out]">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-teal-600">Imagem anexada!</p>
          </div>
        )}

        {/* === ESTADO: ERRO === */}
        {uploadState.status === "error" && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-red-600 font-medium">{uploadState.message}</p>
            <p className="text-xs text-gray-400">Clique para tentar novamente</p>
          </div>
        )}

        {/* === ESTADO: IDLE === */}
        {uploadState.status === "idle" && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDragActive ? "bg-teal-100" : "bg-gray-100"
            }`}>
              <svg
                className={`w-5 h-5 transition-colors ${isDragActive ? "text-teal-500" : "text-gray-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {isDragActive ? "Solte para anexar" : "Arraste ou clique para selecionar"}
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP — max 10 MB</p>
          </div>
        )}
      </div>

      {/* Galeria */}
      {imagens.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {imagens.map((img) => (
            <ImageCard key={img.id} img={img} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageCard({ img, postId }: { img: Imagem; postId: string }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!confirm("Remover esta imagem?")) return;
    setExcluindo(true);
    const { excluirImagemAction } = await import("@/app/(dashboard)/posts/[id]/actions");
    await excluirImagemAction(img.id, postId);
    router.refresh();
  }

  return (
    <div className={`relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50 transition-opacity ${excluindo ? "opacity-40 pointer-events-none" : ""}`}>
      {excluindo && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={img.caminhoArquivo}
        alt={`Versao ${img.versao}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
          <a
            href={img.caminhoArquivo}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-lg p-1.5 hover:bg-gray-100"
            title="Ver original"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </a>
          <button
            onClick={excluir}
            className="bg-white rounded-lg p-1.5 hover:bg-red-50"
            title="Excluir"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
        v{img.versao}
      </span>
    </div>
  );
}
