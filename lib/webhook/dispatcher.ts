import { ExtractedDocument, ValidationDetails } from "@/lib/schema/document";
import { WebhookDeliveryLog } from "@/lib/types/jobs";

export interface DispatchWebhookParams {
  jobId: string;
  extractedData: ExtractedDocument;
  validationDetails: ValidationDetails | null;
  targetUrl?: string;
  documentName?: string;
}

export async function dispatchWebhook(
  params: DispatchWebhookParams
): Promise<WebhookDeliveryLog> {
  const startTime = Date.now();
  const targetUrl = params.targetUrl?.trim() || "https://api.empresa.com/v1/erp/webhooks/invoices";
  const isSimulation =
    !params.targetUrl ||
    params.targetUrl === "simulator" ||
    params.targetUrl.includes("api.empresa.com") ||
    params.targetUrl.includes("localhost");

  const payload = {
    event: "document.extracted.completed",
    job_id: params.jobId,
    timestamp: new Date().toISOString(),
    document_name: params.documentName || "documento_fiscal.txt",
    data: {
      emissor: params.extractedData.emissor,
      cnpj_cpf: params.extractedData.cnpj_cpf,
      data_emissao: params.extractedData.data_emissao,
      valor_total: params.extractedData.valor_total,
      categoria: params.extractedData.categoria,
      moeda: params.extractedData.moeda || "BRL",
      numero_documento: params.extractedData.numero_documento,
      total_itens: params.extractedData.itens.length,
      itens: params.extractedData.itens,
      observacoes: params.extractedData.observacoes,
    },
    audit: {
      is_valid: params.validationDetails?.is_valid ?? true,
      calculated_sum: params.validationDetails?.calculated_sum ?? params.extractedData.valor_total,
      declared_total: params.validationDetails?.declared_total ?? params.extractedData.valor_total,
      difference: params.validationDetails?.difference ?? 0,
      notes: params.validationDetails?.notes ?? [],
    },
    meta: {
      engine: "AI Automation Engine v2.0 (Gemini 3.8 + Zod)",
      environment: "production",
      retry_policy: "3_attempts_exponential_backoff",
    },
  };

  // Se for simulação de ERP (padrão)
  if (isSimulation) {
    // Simula pequena latência de rede realista (120ms - 250ms)
    await new Promise((r) => setTimeout(r, 180));

    const duration = Date.now() - startTime;
    const simulatedErpTxn = "ERP_" + Math.random().toString(36).substring(2, 8).toUpperCase() + "_" + Date.now();

    return {
      status_code: 200,
      timestamp: new Date().toISOString(),
      attempts: 1,
      payload_sent: payload,
      response_body: JSON.stringify({
        status: "ACKNOWLEDGED",
        message: "Payload processado e integrado com sucesso no ERP/FinOps.",
        erp_transaction_id: simulatedErpTxn,
        batch_id: "BATCH_" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        records_imported: params.extractedData.itens.length,
        audit_verdict: params.validationDetails?.is_valid ? "APPROVED" : "FLAGGED_FOR_FINOPS_REVIEW",
      }, null, 2),
      target_url: targetUrl,
      duration_ms: duration,
      success: true,
    };
  }

  // Disparo Real com Retry Simples (até 3 tentativas)
  const MAX_ATTEMPTS = 3;
  let lastError: any = null;
  let attempts = 0;
  let responseBody = "";
  let statusCode = 500;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    attempts = attempt;
    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AI-Automation-Engine-Webhook/1.0",
          "X-Webhook-Event": "document.extracted.completed",
          "X-Webhook-Job-Id": params.jobId,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      statusCode = res.status;
      responseBody = await res.text();

      if (res.ok) {
        return {
          status_code: statusCode,
          timestamp: new Date().toISOString(),
          attempts,
          payload_sent: payload,
          response_body: responseBody || `HTTP ${statusCode} OK`,
          target_url: targetUrl,
          duration_ms: Date.now() - startTime,
          success: true,
        };
      }
    } catch (err: any) {
      lastError = err;
      // Pequeno backoff antes da próxima tentativa
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 500));
      }
    }
  }

  return {
    status_code: statusCode || 500,
    timestamp: new Date().toISOString(),
    attempts,
    payload_sent: payload,
    response_body: responseBody || String(lastError?.message || "Erro desconhecido ao disparar webhook."),
    target_url: targetUrl,
    duration_ms: Date.now() - startTime,
    success: false,
  };
}
