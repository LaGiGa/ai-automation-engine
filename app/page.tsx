"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProcessingJob } from "@/lib/types/jobs";
import { JobsService } from "@/lib/supabase/jobs-service";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { EngineHeader } from "@/components/engine/header";
import { StatsBar } from "@/components/engine/stats-bar";
import { InputPanel } from "@/components/engine/input-panel";
import { PipelineStepper } from "@/components/engine/pipeline-stepper";
import { JobsList } from "@/components/engine/jobs-list";
import { JobDrawer } from "@/components/engine/job-drawer";
import { MermaidModal } from "@/components/engine/mermaid-modal";
import { SqlSchemaModal } from "@/components/engine/sql-schema-modal";

export default function App() {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRetryingWebhook, setIsRetryingWebhook] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [mermaidModalOpen, setMermaidModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carrega jobs persistidos
  useEffect(() => {
    let isMounted = true;

    JobsService.listJobs()
      .then((data) => {
        if (isMounted) {
          setJobs(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Erro carregando jobs:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Execução do Pipeline Completo
  const handleProcess = async (params: {
    rawInput: string;
    documentName: string;
    documentType: string;
    webhookUrl?: string;
    simulateDiscrepancy: boolean;
    imageBase64?: string;
    imageMimeType?: string;
  }) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw_input: params.rawInput,
          document_name: params.documentName,
          document_type: params.documentType,
          webhook_url: params.webhookUrl,
          simulate_discrepancy: params.simulateDiscrepancy,
          imageBase64: params.imageBase64,
          imageMimeType: params.imageMimeType,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Erro na extração (Status ${response.status})`);
      }

      if (result.job) {
        // Persiste o job retornado
        await JobsService.saveJob(result.job);
        setJobs((prev) => [result.job, ...prev.filter((j) => j.id !== result.job.id)]);
        // Abre imediatamente a gaveta de inspeção para o usuário analisar os dados extraídos
        setSelectedJob(result.job);
      }
    } catch (err: any) {
      console.error("Erro no processamento:", err);
      setErrorMessage(
        err?.message || "Ocorreu um erro ao processar o documento. Verifique as credenciais da API."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-disparo de Webhook com política de Retry
  const handleRetryWebhook = async (job: ProcessingJob) => {
    if (!job.extracted_data) return;
    setIsRetryingWebhook(true);

    try {
      const response = await fetch("/api/webhook/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
          extractedData: job.extracted_data,
          validationDetails: job.validation_details,
          targetUrl: job.webhook_url,
          documentName: job.document_name,
        }),
      });

      const data = await response.json();

      if (data.webhook_log) {
        const updatedJob: ProcessingJob = {
          ...job,
          webhook_status: data.webhook_log.success
            ? data.webhook_log.target_url.includes("api.empresa.com")
              ? "simulated"
              : "success"
            : "failed",
          webhook_response: data.webhook_log,
          updated_at: new Date().toISOString(),
        };

        await JobsService.saveJob(updatedJob);
        setJobs((prev) => prev.map((j) => (j.id === job.id ? updatedJob : j)));
        setSelectedJob(updatedJob);
      }
    } catch (err) {
      console.error("Erro re-disparando webhook:", err);
    } finally {
      setIsRetryingWebhook(false);
    }
  };

  // Deletar job
  const handleDeleteJob = async (id: string) => {
    await JobsService.deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (selectedJob?.id === id) {
      setSelectedJob(null);
    }
  };

  // Resetar amostras para demonstração
  const handleResetSamples = async () => {
    setIsResetting(true);
    const defaults = await JobsService.resetDefaultJobs();
    setJobs(defaults);
    setTimeout(() => setIsResetting(false), 400);
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 text-zinc-900 flex flex-col font-sans">
      {/* Header Corporativo */}
      <EngineHeader
        isSupabaseLive={isSupabaseConfigured}
        onOpenSqlModal={() => setSqlModalOpen(true)}
        onOpenMermaidModal={() => setMermaidModalOpen(true)}
        onResetSamples={handleResetSamples}
        isResetting={isResetting}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Atenção:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-bold hover:text-red-950 px-2 py-0.5 rounded cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Top KPIs / Stats Bar */}
        <StatsBar jobs={jobs} />

        {/* Live Pipeline Execution Stepper (Ativo durante chamada de IA) */}
        <PipelineStepper isProcessing={isProcessing} />

        {/* 1. Document Intake & Pipeline Configuration Panel */}
        <InputPanel onProcess={handleProcess} isProcessing={isProcessing} />

        {/* 2. Processed Jobs Table / History */}
        <JobsList
          jobs={jobs}
          onSelectJob={(job) => setSelectedJob(job)}
          onDeleteJob={handleDeleteJob}
        />
      </main>

      {/* Deep Inspection Drawer (Resumo, Auditoria Matemática, Itens, JSONB e Webhooks) */}
      <JobDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onRetryWebhook={handleRetryWebhook}
        isRetryingWebhook={isRetryingWebhook}
      />

      {/* Mermaid Architecture Modal */}
      <MermaidModal
        open={mermaidModalOpen}
        onOpenChange={setMermaidModalOpen}
      />

      {/* Supabase SQL DDL Modal */}
      <SqlSchemaModal
        open={sqlModalOpen}
        onOpenChange={setSqlModalOpen}
      />
    </div>
  );
}
