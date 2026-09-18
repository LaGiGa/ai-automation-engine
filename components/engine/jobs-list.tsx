"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProcessingJob } from "@/lib/types/jobs";
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Trash2,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface JobsListProps {
  jobs: ProcessingJob[];
  onSelectJob: (job: ProcessingJob) => void;
  onDeleteJob: (id: string) => void;
}

export function JobsList({ jobs, onSelectJob, onDeleteJob }: JobsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "discrepancy" | "webhook">("all");

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    const docName = (job.document_name || "").toLowerCase();
    const emissor = (job.extracted_data?.emissor || "").toLowerCase();
    const categoria = (job.extracted_data?.categoria || "").toLowerCase();
    const cnpj = (job.extracted_data?.cnpj_cpf || "").toLowerCase();

    const matchesSearch =
      docName.includes(term) ||
      emissor.includes(term) ||
      categoria.includes(term) ||
      cnpj.includes(term);

    if (!matchesSearch) return false;

    if (statusFilter === "valid") return job.validation_status === "valid";
    if (statusFilter === "discrepancy") return job.validation_status === "discrepancy";
    if (statusFilter === "webhook")
      return job.webhook_status === "success" || job.webhook_status === "simulated";

    return true;
  });

  return (
    <Card className="border-zinc-200 shadow-sm bg-white">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            2. Histórico de Processamentos & Jobs Extraídos
          </CardTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Clique em qualquer linha para inspecionar o JSON extraído, os cálculos matemáticos e os logs de webhook
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por emissor, doc, CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-white text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Todos ({jobs.length})
            </button>
            <button
              onClick={() => setStatusFilter("valid")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                statusFilter === "valid"
                  ? "bg-white text-emerald-800 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-emerald-700"
              }`}
            >
              Válidos
            </button>
            <button
              onClick={() => setStatusFilter("discrepancy")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                statusFilter === "discrepancy"
                  ? "bg-white text-amber-800 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-amber-700"
              }`}
            >
              Discrepâncias
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-800">Nenhum job encontrado</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Utilize os exemplos rápidos acima ou envie o texto de um documento para iniciar o pipeline de extração estruturada.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 overflow-x-auto">
            {filteredJobs.map((job) => {
              const ext = job.extracted_data;
              const val = job.validation_details;
              const isDiscrepancy = job.validation_status === "discrepancy";
              const isValid = job.validation_status === "valid";
              const formattedDate = new Date(job.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="p-4 hover:bg-zinc-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  {/* Left: Document details & Emissor */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isDiscrepancy
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : isValid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {isDiscrepancy ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-zinc-900 group-hover:text-indigo-600 transition-colors truncate max-w-md">
                          {ext?.emissor || job.document_name}
                        </span>
                        {ext?.categoria && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                            {ext.categoria}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 flex-wrap">
                        <span className="font-mono text-[11px] text-zinc-400">
                          {job.document_name}
                        </span>
                        {ext?.cnpj_cpf && (
                          <span className="font-mono text-[11px] text-zinc-600">
                            CNPJ: {ext.cnpj_cpf}
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Math Validation & Financials */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900 font-mono">
                        {ext?.moeda || "BRL"}{" "}
                        {ext?.valor_total
                          ? Number(ext.valor_total).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })
                          : "0,00"}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {ext?.itens?.length || 0} {ext?.itens?.length === 1 ? "item faturado" : "itens faturados"}
                      </p>
                    </div>

                    {/* Validation Pill */}
                    <div className="min-w-[130px] flex flex-col items-end">
                      {isDiscrepancy ? (
                        <Badge variant="warning" className="gap-1 font-semibold text-[11px]">
                          <AlertTriangle className="h-3 w-3" />
                          Discrepância FinOps
                        </Badge>
                      ) : isValid ? (
                        <Badge variant="success" className="gap-1 font-semibold text-[11px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Cálculo 100% Válido
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">
                          Pendente
                        </Badge>
                      )}

                      {/* Webhook Status */}
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 font-mono">
                        <Send className="h-2.5 w-2.5 text-indigo-500" />
                        {job.webhook_status === "simulated"
                          ? "ERP Simulado (200 OK)"
                          : job.webhook_status === "success"
                          ? "Webhook Enviado (200)"
                          : "Webhook Pendente"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pl-2 border-l border-zinc-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectJob(job);
                        }}
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Ver detalhes completos do JSON e Webhook"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteJob(job.id);
                        }}
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                        title="Excluir job do histórico"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
