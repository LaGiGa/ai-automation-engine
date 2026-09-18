import { NextRequest, NextResponse } from "next/server";
import { extractDocumentData } from "@/lib/ai/extractor";
import { validateAndSanitizeDocument } from "@/lib/validation/sanitizer";
import { dispatchWebhook } from "@/lib/webhook/dispatcher";
import { ProcessingJob } from "@/lib/types/jobs";

export async function GET() {
  // Simple endpoint to test health or retrieve server timestamp
  return NextResponse.json({
    status: "online",
    engine: "AI Automation Engine v2.0",
    supported_models: ["gemini-3.8-flash", "gpt-4o-mini"],
  });
}

export async function POST(req: NextRequest) {
  const jobId = "job_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
  const createdAt = new Date().toISOString();

  try {
    const body = await req.json();
    const {
      raw_input,
      document_name = "Documento_Fiscal.txt",
      document_type = "documento",
      webhook_url,
      imageBase64,
      imageMimeType,
      simulate_discrepancy = false,
    } = body;

    if (!raw_input || typeof raw_input !== "string" || !raw_input.trim()) {
      return NextResponse.json(
        { error: "O campo 'raw_input' (texto do documento ou fatura) é obrigatório." },
        { status: 400 }
      );
    }

    // 1. Extração Estruturada com IA (Zod Schema + Gemini/OpenAI)
    const rawExtracted = await extractDocumentData({
      rawText: raw_input,
      imageBase64,
      imageMimeType,
    });

    // Se o usuário solicitou teste de discrepância forçada para testes de QA
    if (simulate_discrepancy && rawExtracted.valor_total) {
      rawExtracted.valor_total = Math.round((rawExtracted.valor_total + 150.0) * 100) / 100;
    }

    // 2. Validação & Sanitização Matemática (Soma dos Itens == Valor Total)
    const { sanitized, validation, status: validationStatus } =
      validateAndSanitizeDocument(rawExtracted);

    // 3. Webhook Dispatcher
    const webhookLog = await dispatchWebhook({
      jobId,
      extractedData: sanitized,
      validationDetails: validation,
      targetUrl: webhook_url,
      documentName: document_name,
    });

    const completedJob: ProcessingJob = {
      id: jobId,
      status: "completed",
      document_name,
      document_type,
      raw_input,
      extracted_data: sanitized,
      validation_status: validationStatus,
      validation_details: validation,
      webhook_status: webhookLog.success
        ? webhookLog.target_url.includes("api.empresa.com")
          ? "simulated"
          : "success"
        : "failed",
      webhook_url: webhook_url || webhookLog.target_url,
      webhook_response: webhookLog,
      error_message: null,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      job: completedJob,
    });
  } catch (error: any) {
    console.error("Erro no pipeline de extração estruturada:", error);

    const failedJob: Partial<ProcessingJob> = {
      id: jobId,
      status: "failed",
      error_message: error?.message || "Erro desconhecido durante o processamento do pipeline.",
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro durante o processamento do pipeline de IA.",
        job: failedJob,
      },
      { status: 500 }
    );
  }
}
