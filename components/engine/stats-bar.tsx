"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessingJob } from "@/lib/types/jobs";
import { CheckCircle2, AlertTriangle, Send, FileSpreadsheet, DollarSign } from "lucide-react";

interface StatsBarProps {
  jobs: ProcessingJob[];
}

export function StatsBar({ jobs }: StatsBarProps) {
  const totalJobs = jobs.length;
  const validJobs = jobs.filter((j) => j.validation_status === "valid").length;
  const discrepancyJobs = jobs.filter((j) => j.validation_status === "discrepancy").length;
  const webhooksSent = jobs.filter((j) => j.webhook_status === "success" || j.webhook_status === "simulated").length;

  const totalMonetary = jobs.reduce((acc, j) => {
    if (j.extracted_data?.valor_total) {
      return acc + (Number(j.extracted_data.valor_total) || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Processado */}
      <Card className="border-zinc-200 shadow-xs bg-white">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
              Total Processados
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-0.5">{totalJobs}</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Jobs no histórico</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Conformidade Fiscal (Válidos) */}
      <Card className="border-emerald-200/80 shadow-xs bg-emerald-50/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
              Conformidade Fiscal
            </p>
            <h3 className="text-2xl font-bold text-emerald-900 mt-0.5">{validJobs}</h3>
            <p className="text-[11px] text-emerald-600 mt-1">Soma de itens bate 100%</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Discrepâncias FinOps */}
      <Card className="border-amber-200/80 shadow-xs bg-amber-50/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
              Alertas FinOps
            </p>
            <h3 className="text-2xl font-bold text-amber-900 mt-0.5">{discrepancyJobs}</h3>
            <p className="text-[11px] text-amber-600 mt-1">Divergências de cálculo</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Webhooks Despachados */}
      <Card className="border-indigo-200/80 shadow-xs bg-indigo-50/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-indigo-700">
              Webhooks Enviados
            </p>
            <h3 className="text-2xl font-bold text-indigo-900 mt-0.5">{webhooksSent}</h3>
            <p className="text-[11px] text-indigo-600 mt-1">Integrados ao ERP/Slack</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Send className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
