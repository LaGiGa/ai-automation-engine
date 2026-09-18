"use client";

import React, { useState } from "react";
import { ProcessingJob } from "@/lib/types/jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileCode,
  ListOrdered,
  FileText,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Building,
  Calendar,
  Layers,
  DollarSign,
} from "lucide-react";

interface JobDrawerProps {
  job: ProcessingJob | null;
  onClose: () => void;
  onRetryWebhook: (job: ProcessingJob) => Promise<void>;
  isRetryingWebhook?: boolean;
}

export function JobDrawer({
  job,
  onClose,
  onRetryWebhook,
  isRetryingWebhook,
}: JobDrawerProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "items" | "json" | "webhook" | "raw"
  >("overview");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  if (!job) return null;

  const ext = job.extracted_data;
  const val = job.validation_details;
  const isDiscrepancy = job.validation_status === "discrepancy";
  const isValid = job.validation_status === "valid";

  const handleCopyJson = () => {
    if (!ext) return;
    navigator.clipboard.writeText(JSON.stringify(ext, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(job.raw_input);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-zinc-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 truncate max-w-sm sm:max-w-md">
                {ext?.emissor || job.document_name}
              </h2>
              {isDiscrepancy ? (
                <Badge variant="warning" className="gap-1 text-[10px]">
                  <AlertTriangle className="h-3 w-3" />
                  Discrepância
                </Badge>
              ) : isValid ? (
                <Badge variant="success" className="gap-1 text-[10px]">
                  <CheckCircle2 className="h-3 w-3" />
                  Conforme
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              ID: {job.id} • {job.document_name}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60"
            id="btn-close-job-drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 px-4 sm:px-5 bg-white gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Resumo & Auditoria
          </button>

          <button
            onClick={() => setActiveTab("items")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "items"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Itens Faturados ({ext?.itens?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("json")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "json"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            JSONB Extraído
          </button>

          <button
            onClick={() => setActiveTab("webhook")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "webhook"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Webhook Dispatch
          </button>

          <button
            onClick={() => setActiveTab("raw")}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "raw"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Texto Bruto
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW & MATH AUDIT */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* FinOps Mathematical Audit Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isDiscrepancy
                    ? "bg-amber-50/70 border-amber-300 text-amber-950"
                    : "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isDiscrepancy ? "bg-amber-200 text-amber-800" : "bg-emerald-200 text-emerald-800"
                    }`}
                  >
                    {isDiscrepancy ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {isDiscrepancy ? "Alerta de Auditoria FinOps (Divergência)" : "Conformidade Fiscal Aprovada"}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      {val?.notes?.[0] ||
                        (isDiscrepancy
                          ? "A soma calculada dos itens difere do valor total declarado."
                          : "A soma matemática dos itens coincide perfeitamente com o total da nota.")}
                    </p>

                    {/* Calculation Comparison Table */}
                    <div className="mt-3 grid grid-cols-3 gap-2 bg-white/80 p-2.5 rounded-lg border border-black/5 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">
                          Soma dos Itens
                        </span>
                        <span className="font-bold text-zinc-900">
                          {ext?.moeda || "BRL"}{" "}
                          {val?.calculated_sum?.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">
                          Total Declarado
                        </span>
                        <span className="font-bold text-zinc-900">
                          {ext?.moeda || "BRL"}{" "}
                          {val?.declared_total?.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">
                          Diferença
                        </span>
                        <span
                          className={`font-bold ${
                            isDiscrepancy ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          {ext?.moeda || "BRL"}{" "}
                          {val?.difference?.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Key Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase block">
                    Emissor / Razão Social
                  </span>
                  <p className="text-xs font-bold text-zinc-900 mt-1">
                    {ext?.emissor || "Não identificado"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase block">
                    CNPJ / CPF
                  </span>
                  <p className="text-xs font-mono font-bold text-zinc-900 mt-1">
                    {ext?.cnpj_cpf || "Não informado"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase block">
                    Data de Emissão
                  </span>
                  <p className="text-xs font-bold text-zinc-900 mt-1">
                    {ext?.data_emissao || "Não informada"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase block">
                    Categoria Contábil
                  </span>
                  <p className="text-xs font-bold text-indigo-900 mt-1">
                    {ext?.categoria || "Geral"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 sm:col-span-2">
                  <span className="text-[11px] text-zinc-500 font-semibold uppercase block">
                    Valor Total Faturado
                  </span>
                  <p className="text-lg font-mono font-bold text-zinc-900 mt-1">
                    {ext?.moeda || "BRL"}{" "}
                    {ext?.valor_total
                      ? Number(ext.valor_total).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })
                      : "0,00"}
                  </p>
                </div>

                {ext?.observacoes && (
                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 sm:col-span-2">
                    <span className="text-[11px] text-zinc-500 font-semibold uppercase block">
                      Observações / Condições
                    </span>
                    <p className="text-xs text-zinc-700 mt-1 leading-relaxed">
                      {ext.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ITEMS TABLE */}
          {activeTab === "items" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Relação de Produtos e Serviços Faturados:
                </span>
                <span className="text-xs text-zinc-500">
                  Total de {ext?.itens?.length || 0} itens
                </span>
              </div>

              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200">
                    <tr>
                      <th className="p-3">Descrição</th>
                      <th className="p-3 text-right">Qtd</th>
                      <th className="p-3 text-right">Preço Unit.</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono">
                    {ext?.itens?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="p-3 font-sans font-medium text-zinc-900">
                          {item.descricao}
                        </td>
                        <td className="p-3 text-right text-zinc-600">
                          {item.quantidade}
                        </td>
                        <td className="p-3 text-right text-zinc-700">
                          {ext?.moeda || "BRL"}{" "}
                          {Number(item.valor_unitario).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right font-bold text-zinc-900">
                          {ext?.moeda || "BRL"}{" "}
                          {(
                            item.valor_total_item ||
                            Number(item.quantidade) * Number(item.valor_unitario)
                          ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-zinc-50/80 font-mono font-bold text-xs border-t border-zinc-200">
                    <tr>
                      <td colSpan={3} className="p-3 text-right text-zinc-700">
                        Soma Calculada:
                      </td>
                      <td className="p-3 text-right text-indigo-900">
                        {ext?.moeda || "BRL"}{" "}
                        {val?.calculated_sum?.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: JSONB VIEWER */}
          {activeTab === "json" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Payload JSONB (Supabase PostgreSQL):
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-7 text-xs gap-1.5 text-zinc-600"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar JSON
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner border border-zinc-800">
                <code>{JSON.stringify(ext, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* TAB 4: WEBHOOK DISPATCH LOGS */}
          {activeTab === "webhook" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-zinc-900">
                      Disparo de Webhook (POST)
                    </span>
                  </div>
                  <Badge variant="success" className="text-[10px] font-mono">
                    HTTP {job.webhook_response?.status_code || 200} OK
                  </Badge>
                </div>

                <div className="text-xs space-y-1 font-mono">
                  <p className="text-zinc-600 truncate">
                    <strong className="font-sans text-zinc-800">Destino:</strong>{" "}
                    {job.webhook_url || job.webhook_response?.target_url || "https://api.empresa.com/v1/erp/webhooks/invoices"}
                  </p>
                  <p className="text-zinc-600">
                    <strong className="font-sans text-zinc-800">Tentativas:</strong>{" "}
                    {job.webhook_response?.attempts || 1} de 3
                  </p>
                  <p className="text-zinc-600">
                    <strong className="font-sans text-zinc-800">Timestamp:</strong>{" "}
                    {job.webhook_response?.timestamp || job.created_at}
                  </p>
                  <p className="text-zinc-600">
                    <strong className="font-sans text-zinc-800">Latência:</strong>{" "}
                    {job.webhook_response?.duration_ms || 150} ms
                  </p>
                </div>

                {/* Retry Button */}
                <div className="pt-2 border-t border-zinc-200">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetryWebhook(job)}
                    disabled={isRetryingWebhook}
                    className="text-xs gap-1.5 h-8 w-full justify-center text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRetryingWebhook ? "animate-spin" : ""}`} />
                    Re-disparar Webhook com Política de Retry
                  </Button>
                </div>
              </div>

              {/* Payload Sent */}
              <div>
                <span className="text-xs font-semibold text-zinc-700 block mb-1.5">
                  Payload Padronizado Enviado:
                </span>
                <pre className="p-3 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800">
                  <code>
                    {JSON.stringify(
                      job.webhook_response?.payload_sent || {
                        event: "document.extracted.completed",
                        job_id: job.id,
                        data: ext,
                      },
                      null,
                      2
                    )}
                  </code>
                </pre>
              </div>

              {/* Response Body */}
              {job.webhook_response?.response_body && (
                <div>
                  <span className="text-xs font-semibold text-zinc-700 block mb-1.5">
                    Resposta Retornada pelo Servidor / ERP:
                  </span>
                  <pre className="p-3 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800">
                    <code>{job.webhook_response.response_body}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: RAW INPUT */}
          {activeTab === "raw" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">
                  Entrada Bruta Original Recebida:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRaw}
                  className="h-7 text-xs gap-1.5 text-zinc-600"
                >
                  {copiedRaw ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar Texto
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-50 text-zinc-800 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap border border-zinc-200">
                {job.raw_input}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
