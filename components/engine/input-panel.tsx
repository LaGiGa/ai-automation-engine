"use client";

import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_DOCUMENTS, SampleDocument } from "@/lib/data/sample-documents";
import {
  Upload,
  FileText,
  Sparkles,
  Send,
  X,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Radio,
  ExternalLink,
} from "lucide-react";

interface InputPanelProps {
  onProcess: (params: {
    rawInput: string;
    documentName: string;
    documentType: string;
    webhookUrl?: string;
    simulateDiscrepancy: boolean;
    imageBase64?: string;
    imageMimeType?: string;
  }) => Promise<void>;
  isProcessing: boolean;
}

export function InputPanel({ onProcess, isProcessing }: InputPanelProps) {
  const [rawText, setRawText] = useState("");
  const [documentName, setDocumentName] = useState("NF-e_Servicos_TI.txt");
  const [documentType, setDocumentType] = useState("nfe");
  const [webhookMode, setWebhookMode] = useState<"simulator" | "custom">("simulator");
  const [customWebhookUrl, setCustomWebhookUrl] = useState("");
  const [simulateDiscrepancy, setSimulateDiscrepancy] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    base64?: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega um preset de exemplo com 1 clique
  const handleLoadSample = (sample: SampleDocument) => {
    setRawText(sample.content);
    setDocumentName(`${sample.id}.txt`);
    setDocumentType(sample.id.includes("nfe") ? "nfe" : sample.id.includes("legal") ? "contrato" : "fatura");
    setUploadedFile(null);
    if (sample.id === "discrepancy-finops") {
      setSimulateDiscrepancy(false); // O texto já contém a discrepância em si!
    }
  };

  // Manipulador de upload de arquivo
  const handleFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isText =
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".json") ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".md");

    setDocumentName(file.name);
    setDocumentType(
      file.name.toLowerCase().includes("nfe") || file.name.toLowerCase().includes("nf")
        ? "nfe"
        : file.name.toLowerCase().includes("contrat")
        ? "contrato"
        : "documento"
    );

    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRawText(text);
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      reader.readAsText(file);
    } else if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          base64,
        });
        setRawText(`[Imagem anexada: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\nPor favor, realize OCR e extraia os campos fiscais com base no schema estruturado.`);
      };
      reader.readAsDataURL(file);
    } else {
      // PDF ou binário
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || "";
        // Se conseguir ler algo em texto
        setRawText(text || `[Documento binário carregado: ${file.name}]`);
        setUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || isProcessing) return;

    const webhookUrl =
      webhookMode === "simulator"
        ? "https://api.empresa.com/v1/erp/webhooks/invoices"
        : customWebhookUrl;

    await onProcess({
      rawInput: rawText,
      documentName: documentName || "documento_fiscal.txt",
      documentType,
      webhookUrl,
      simulateDiscrepancy,
      imageBase64: uploadedFile?.base64,
      imageMimeType: uploadedFile?.type,
    });
  };

  return (
    <Card className="border-zinc-200 shadow-sm bg-white mb-6">
      <CardHeader className="pb-3 border-b border-zinc-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              1. Entrada de Documento & Configuração do Pipeline
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Envie um documento bruto (fatura, nota fiscal ou contrato) para extração com Zod + Gemini 3.8
            </CardDescription>
          </div>

          {/* Quick Clear */}
          {rawText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRawText("");
                setUploadedFile(null);
              }}
              disabled={isProcessing}
              className="h-7 text-xs text-zinc-500 hover:text-red-600 gap-1 px-2"
            >
              <X className="h-3 w-3" />
              Limpar Texto
            </Button>
          )}
        </div>

        {/* 1-Click Samples Toolbar */}
        <div className="pt-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Exemplos Corporativos Rápidos (1-Clique):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSample(sample)}
                disabled={isProcessing}
                className="text-left px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50/70 hover:bg-indigo-50/70 hover:border-indigo-300 transition-all text-xs group cursor-pointer"
                id={`sample-btn-${sample.id}`}
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-zinc-500 group-hover:text-indigo-600" />
                  <span className="font-semibold text-zinc-800 group-hover:text-indigo-900">
                    {sample.title}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      sample.id === "discrepancy-finops"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {sample.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop Upload Zone + Textarea */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/40"
                  : uploadedFile
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf,.csv,.json,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {uploadedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 line-clamp-1">{uploadedFile.name}</p>
                    <p className="text-[11px] text-zinc-500">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • Pronto para análise
                    </p>
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold mt-1">
                    Clique para trocar de arquivo
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-zinc-200/70 text-zinc-600 flex items-center justify-center">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">
                      Arraste ou clique para selecionar arquivo
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Suporta TXT, PDF, DANFE, Imagens (PNG/JPG)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Raw Text Input */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700">
                  Conteúdo Bruto do Documento / Relatório Não Estruturado:
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {rawText.length} caracteres
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Cole aqui o texto bruto de uma nota fiscal, fatura, contrato de prestação de serviços ou demonstrativo financeiro..."
                rows={7}
                disabled={isProcessing}
                className="w-full rounded-xl border border-zinc-200 p-3 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-y shadow-xs"
                id="raw-input-textarea"
              />
            </div>
          </div>

          {/* Webhook Configuration & FinOps QA Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
            {/* Webhook Selector */}
            <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50/50">
              <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 mb-2">
                <Send className="h-3.5 w-3.5 text-indigo-600" />
                Destino do Webhook Dispatcher:
              </label>

              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="radio"
                    name="webhookMode"
                    value="simulator"
                    checked={webhookMode === "simulator"}
                    onChange={() => setWebhookMode("simulator")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Simulador Interno ERP (Padrão)</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="radio"
                    name="webhookMode"
                    value="custom"
                    checked={webhookMode === "custom"}
                    onChange={() => setWebhookMode("custom")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>URL Externa Customizada</span>
                </label>
              </div>

              {webhookMode === "simulator" ? (
                <div className="text-[11px] text-zinc-500 font-mono bg-white p-2 rounded border border-zinc-200 flex items-center justify-between">
                  <span className="truncate">https://api.empresa.com/v1/erp/webhooks/invoices</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded ml-2 shrink-0">
                    HTTP 200 Simulado
                  </span>
                </div>
              ) : (
                <input
                  type="url"
                  value={customWebhookUrl}
                  onChange={(e) => setCustomWebhookUrl(e.target.value)}
                  placeholder="https://webhook.site/uuid ou endpoint de ERP/Slack..."
                  className="w-full rounded-lg border border-zinc-300 p-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              )}
            </div>

            {/* QA Testing Options */}
            <div className="rounded-xl border border-zinc-200 p-3 bg-zinc-50/50 flex flex-col justify-between">
              <div>
                <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  Teste de Auditoria FinOps (QA):
                </label>
                <p className="text-[11px] text-zinc-500 mb-2">
                  Permite injetar uma discrepância matemática artificial (+ R$ 150,00) para validar se o sistema acusa divergência fiscal.
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-800 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateDiscrepancy}
                  onChange={(e) => setSimulateDiscrepancy(e.target.checked)}
                  className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>Forçar discrepância de cálculo para testar alerta de auditoria</span>
              </label>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Modelo ativo: <strong>gemini-3.8-flash</strong> (Structured Output)</span>
            </div>

            <Button
              type="submit"
              disabled={!rawText.trim() || isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 px-6 rounded-xl shadow-sm gap-2 transition-all cursor-pointer"
              id="btn-run-pipeline"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Executando Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Executar Pipeline de Extração com IA</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
