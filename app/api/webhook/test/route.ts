import { NextRequest, NextResponse } from "next/server";
import { dispatchWebhook } from "@/lib/webhook/dispatcher";
import { ExtractedDocument, ValidationDetails } from "@/lib/schema/document";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobId = "test_job_" + Date.now(),
      extractedData,
      validationDetails,
      targetUrl,
      documentName,
    } = body;

    if (!extractedData) {
      return NextResponse.json(
        { error: "Dados extraídos ('extractedData') são obrigatórios para teste do webhook." },
        { status: 400 }
      );
    }

    const log = await dispatchWebhook({
      jobId,
      extractedData: extractedData as ExtractedDocument,
      validationDetails: validationDetails as ValidationDetails | null,
      targetUrl,
      documentName,
    });

    return NextResponse.json({
      success: log.success,
      webhook_log: log,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao disparar webhook." },
      { status: 500 }
    );
  }
}
