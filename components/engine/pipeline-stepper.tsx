"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, Scale, Database, Send, AlertTriangle } from "lucide-react";

interface PipelineStepperProps {
  isProcessing: boolean;
  currentStep?: number; // 1, 2, 3, 4
}

export function PipelineStepper({ isProcessing, currentStep: propStep }: PipelineStepperProps) {
  const [internalStep, setInternalStep] = useState(1);

  // Auto-progress simulation for smooth UI feedback during async AI call
  useEffect(() => {
    if (!isProcessing) return;

    const t1 = setTimeout(() => setInternalStep(2), 700);
    const t2 = setTimeout(() => setInternalStep(3), 2200);
    const t3 = setTimeout(() => setInternalStep(4), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setInternalStep(1);
    };
  }, [isProcessing]);

  const activeStep = propStep ?? internalStep;

  const steps = [
    {
      num: 1,
      title: "Recepção de Entrada",
      desc: "Parsing do texto ou arquivo bruto",
      icon: Database,
    },
    {
      num: 2,
      title: "Extração Estruturada IA",
      desc: "Zod Schema + Gemini 3.8 Flash",
      icon: Sparkles,
    },
    {
      num: 3,
      title: "Validação & Sanitização",
      desc: "Conferência matemática: ∑(itens) == total",
      icon: Scale,
    },
    {
      num: 4,
      title: "JSONB & Webhook Dispatch",
      desc: "Persistência no PostgreSQL e POST ERP",
      icon: Send,
    },
  ];

  if (!isProcessing) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md mb-6 border border-indigo-700/50 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            Pipeline Ativo em Execução
          </span>
        </div>
        <span className="text-xs text-indigo-300 font-mono">
          Etapa {activeStep} de 4
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isDone = activeStep > step.num;
          const isCurrent = activeStep === step.num;
          const isPending = activeStep < step.num;
          const Icon = step.icon;

          return (
            <div
              key={step.num}
              className={`p-3 rounded-xl border transition-all ${
                isCurrent
                  ? "bg-white/10 border-indigo-400 shadow-sm"
                  : isDone
                  ? "bg-emerald-500/10 border-emerald-500/30 text-zinc-300"
                  : "bg-white/5 border-white/5 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 text-indigo-300 animate-spin shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-zinc-500 text-[10px] flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                )}
                <span
                  className={`text-xs font-semibold truncate ${
                    isCurrent ? "text-white" : isDone ? "text-emerald-200" : "text-zinc-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300/80 leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
