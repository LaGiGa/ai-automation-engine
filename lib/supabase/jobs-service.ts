import { ProcessingJob, JobStatus } from "@/lib/types/jobs";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getServerSupabase } from "@/lib/supabase/server";

const STORAGE_KEY_JOBS = "ai_automation_engine_jobs_v2";

// Seed jobs padrão para exibição inicial rica de Backoffice e FinOps
const INITIAL_JOBS: ProcessingJob[] = [
  {
    id: "job-001-cloudstack",
    status: "completed",
    document_name: "NF-e_CloudStack_4892.txt",
    document_type: "nfe",
    raw_input: `PREFEITURA MUNICIPAL DE SÃO PAULO - NOTA FISCAL DE SERVIÇOS NFS-e Nº 0004892\nPRESTADOR: CLOUDSTACK TECNOLOGIA E INFRAESTRUTURA S.A. CNPJ: 28.491.730/0001-85\n1. Instâncias EC2 High-Memory - Qtd: 3 x R$ 1.650,00 = R$ 4.950,00\n2. Banco PostgreSQL Multi-AZ - Qtd: 1 x R$ 2.300,00 = R$ 2.300,00\n3. Tráfego CDN 10TB - Qtd: 1 x R$ 1.200,00 = R$ 1.200,00\nVALOR TOTAL = R$ 8.450,00`,
    extracted_data: {
      emissor: "CLOUDSTACK TECNOLOGIA E INFRAESTRUTURA S.A.",
      cnpj_cpf: "28.491.730/0001-85",
      data_emissao: "15/02/2025",
      valor_total: 8450.0,
      categoria: "Infraestrutura Cloud & TI",
      moeda: "BRL",
      numero_documento: "0004892",
      itens: [
        { descricao: "Instâncias Computacionais EC2 High-Memory", quantidade: 3, valor_unitario: 1650.0, valor_total_item: 4950.0 },
        { descricao: "Banco de Dados Gerenciado PostgreSQL Multi-AZ", quantidade: 1, valor_unitario: 2300.0, valor_total_item: 2300.0 },
        { descricao: "Tráfego de Rede e Distribuição CDN 10TB", quantidade: 1, valor_unitario: 1200.0, valor_total_item: 1200.0 },
      ],
      observacoes: "Pagamento via boleto faturado 30 DDL",
    },
    validation_status: "valid",
    validation_details: {
      calculated_sum: 8450.0,
      declared_total: 8450.0,
      difference: 0.0,
      is_valid: true,
      notes: ["Conformidade Fiscal: Soma calculada dos itens (R$ 8.450,00) confere perfeitamente com o valor total declarado (R$ 8.450,00)."],
    },
    webhook_status: "simulated",
    webhook_url: "https://api.empresa.com/v1/erp/webhooks/invoices",
    webhook_response: {
      status_code: 200,
      timestamp: "2025-02-15T14:32:45Z",
      attempts: 1,
      payload_sent: { event: "document.extracted.completed", job_id: "job-001-cloudstack" },
      response_body: JSON.stringify({ status: "ACKNOWLEDGED", erp_transaction_id: "ERP_SAP_REC_98234", audit_verdict: "APPROVED" }, null, 2),
      target_url: "https://api.empresa.com/v1/erp/webhooks/invoices",
      duration_ms: 142,
      success: true,
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "job-002-discrepancy",
    status: "completed",
    document_name: "DANFE_Suprimentos_FariaLima.txt",
    document_type: "fatura",
    raw_input: `CENTRAL SUPRIMENTOS E INFORMÁTICA LTDA - CNPJ: 17.842.391/0001-60\n- 4 un x Monitor Dell 27 4K a R$ 1.200,00 = R$ 4.800,00\n- 2 un x Docking Station a R$ 560,00 = R$ 1.120,00\nVALOR DECLARADO TOTAL DA NOTA: R$ 6.400,00`,
    extracted_data: {
      emissor: "CENTRAL SUPRIMENTOS E INFORMÁTICA CORPORATIVA LTDA",
      cnpj_cpf: "17.842.391/0001-60",
      data_emissao: "22/02/2025",
      valor_total: 6400.0,
      categoria: "Equipamentos de TI",
      moeda: "BRL",
      itens: [
        { descricao: "Monitor Dell UltraSharp 27 4K", quantidade: 4, valor_unitario: 1200.0, valor_total_item: 4800.0 },
        { descricao: "Docking Station USB-C Thunderbolt 4", quantidade: 2, valor_unitario: 560.0, valor_total_item: 1120.0 },
      ],
      observacoes: "Atenção: Cabeçalho com divergência de cálculo",
    },
    validation_status: "discrepancy",
    validation_details: {
      calculated_sum: 5920.0,
      declared_total: 6400.0,
      difference: 480.0,
      is_valid: false,
      notes: ["Discrepância FinOps detectada! A soma calculada dos itens (R$ 5.920,00) é inferior ao valor total declarado (R$ 6.400,00). Diferença: R$ 480,00."],
      discrepancy_alert: "Discrepância FinOps detectada! Diferença de R$ 480,00 entre itens e total declarado.",
    },
    webhook_status: "simulated",
    webhook_url: "https://api.empresa.com/v1/erp/webhooks/invoices",
    webhook_response: {
      status_code: 200,
      timestamp: "2025-02-22T10:15:20Z",
      attempts: 1,
      payload_sent: { event: "document.extracted.completed", job_id: "job-002-discrepancy" },
      response_body: JSON.stringify({ status: "ACKNOWLEDGED", erp_transaction_id: "ERP_SAP_REC_98411", audit_verdict: "FLAGGED_FOR_FINOPS_REVIEW" }, null, 2),
      target_url: "https://api.empresa.com/v1/erp/webhooks/invoices",
      duration_ms: 198,
      success: true,
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Helper local storage
function getLocalJobs(): ProcessingJob[] {
  if (typeof window === "undefined") return INITIAL_JOBS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOBS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_JOBS;
  }
}

function saveLocalJobs(jobs: ProcessingJob[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error("Erro salvando jobs no localStorage:", e);
  }
}

export const JobsService = {
  async listJobs(): Promise<ProcessingJob[]> {
    const supabase = typeof window !== "undefined" ? getSupabaseClient() : getServerSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("processing_jobs")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data as ProcessingJob[];
        }
      } catch (err) {
        console.warn("Supabase list jobs fallback to local storage:", err);
      }
    }
    return getLocalJobs();
  },

  async getJobById(id: string): Promise<ProcessingJob | null> {
    const supabase = typeof window !== "undefined" ? getSupabaseClient() : getServerSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("processing_jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data as ProcessingJob;
        }
      } catch (err) {
        console.warn("Supabase get job error:", err);
      }
    }

    const localJobs = getLocalJobs();
    return localJobs.find((j) => j.id === id) || null;
  },

  async saveJob(job: ProcessingJob): Promise<ProcessingJob> {
    const supabase = typeof window !== "undefined" ? getSupabaseClient() : getServerSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from("processing_jobs")
          .upsert({
            id: job.id,
            status: job.status,
            document_name: job.document_name,
            document_type: job.document_type || "documento",
            raw_input: job.raw_input,
            extracted_data: job.extracted_data,
            validation_status: job.validation_status,
            validation_details: job.validation_details,
            webhook_status: job.webhook_status,
            webhook_url: job.webhook_url,
            webhook_response: job.webhook_response,
            error_message: job.error_message,
            created_at: job.created_at,
            updated_at: job.updated_at,
          });
      } catch (err) {
        console.warn("Supabase saveJob error, persisting to local storage:", err);
      }
    }

    const localJobs = getLocalJobs();
    const existingIndex = localJobs.findIndex((j) => j.id === job.id);
    if (existingIndex >= 0) {
      localJobs[existingIndex] = job;
    } else {
      localJobs.unshift(job);
    }
    saveLocalJobs(localJobs);
    return job;
  },

  async deleteJob(id: string): Promise<void> {
    const supabase = typeof window !== "undefined" ? getSupabaseClient() : getServerSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from("processing_jobs").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteJob error:", err);
      }
    }

    const localJobs = getLocalJobs().filter((j) => j.id !== id);
    saveLocalJobs(localJobs);
  },

  async resetDefaultJobs(): Promise<ProcessingJob[]> {
    saveLocalJobs(INITIAL_JOBS);
    return INITIAL_JOBS;
  },
};
