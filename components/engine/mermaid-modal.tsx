"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitFork, Copy, Check, Sparkles, Scale, Database, Send } from "lucide-react";

interface MermaidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MermaidModal({ open, onOpenChange }: MermaidModalProps) {
  const [copied, setCopied] = useState(false);

  const mermaidCode = `flowchart TD
    subgraph S1["1. Entrada Bruta"]
        A["📄 Documento Não Estruturado<br/>(Upload PDF/TXT/DANFE/Contrato)"]
        B["🌐 Endpoint REST API<br/>POST /api/jobs"]
        A --> B
    end

    subgraph S2["2. Pipeline de Extração com IA"]
        C["🧠 LLM Engine (Gemini 3.8 Flash / OpenAI)<br/>Structured Outputs"]
        D["📐 Schema Rígido Zod<br/>{ emissor, cnpj_cpf, data, valor_total, itens, categoria }"]
        B --> C
        C --> D
    end

    subgraph S3["3. Validação & Sanitização Matemática"]
        E["⚖️ Auditoria FinOps<br/>Calcula: ∑(quantidade × valor_unitario)"]
        F{"Soma Itens == Valor Total?"}
        E --> F
        F -- "Sim (Tolerância ≤ 0.05)" --> G["✅ Status: Válido"]
        F -- "Não (Divergência)" --> H["⚠️ Status: Discrepância FinOps"]
        G --> I["🧹 Sanitização de CNPJ e Datas"]
        H --> I
    end

    subgraph S4["4. Persistência & Webhooks"]
        J[("🗄️ Supabase PostgreSQL<br/>processing_jobs (JSONB)")]
        K["📡 Webhook Dispatcher com Retry<br/>POST /erp/invoices (Até 3x)"]
        L["📊 Dashboard de Inspeção"]
        I --> J
        J --> K
        K --> L
    end

    D --> E`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <GitFork className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-zinc-900">
                  Arquitetura do Pipeline (Diagrama Mermaid)
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Representação visual do fluxo: Entrada Bruta → Extração IA → Validação → JSONB → Webhook
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs gap-1.5 h-8 text-zinc-700 border-zinc-200"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar Código Mermaid
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Visual High-Level Pipeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 my-3">
          <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-center">
            <div className="h-7 w-7 rounded-full bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
              1
            </div>
            <p className="text-xs font-bold text-zinc-900">Entrada Bruta</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Upload ou texto de fatura</p>
          </div>

          <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 text-center">
            <div className="h-7 w-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
              2
            </div>
            <p className="text-xs font-bold text-indigo-950">Extração Zod + IA</p>
            <p className="text-[10px] text-indigo-700 mt-0.5">Gemini 3.8 JSON Schema</p>
          </div>

          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-center">
            <div className="h-7 w-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
              3
            </div>
            <p className="text-xs font-bold text-amber-950">Validação FinOps</p>
            <p className="text-[10px] text-amber-700 mt-0.5">∑(itens) == valor_total</p>
          </div>

          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
            <div className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
              4
            </div>
            <p className="text-xs font-bold text-emerald-950">Supabase & Webhook</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">JSONB + POST com retry</p>
          </div>
        </div>

        {/* Raw Mermaid Syntax */}
        <div>
          <span className="text-xs font-semibold text-zinc-700 block mb-1.5">
            Código Mermaid para GitHub / Documentação Técnica:
          </span>
          <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800">
            <code>{mermaidCode}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
