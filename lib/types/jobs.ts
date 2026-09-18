import { ExtractedDocument, ValidationDetails } from "@/lib/schema/document";

export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type ValidationStatus = "valid" | "discrepancy" | "failed" | "skipped";
export type WebhookStatus = "idle" | "pending" | "success" | "failed" | "simulated";

export interface WebhookDeliveryLog {
  status_code: number;
  timestamp: string;
  attempts: number;
  payload_sent: Record<string, unknown>;
  response_body: string;
  target_url: string;
  duration_ms: number;
  success: boolean;
}

export interface ProcessingJob {
  id: string;
  status: JobStatus;
  document_name: string;
  document_type?: string;
  raw_input: string;
  extracted_data: ExtractedDocument | null;
  validation_status: ValidationStatus;
  validation_details: ValidationDetails | null;
  webhook_status: WebhookStatus;
  webhook_url?: string;
  webhook_response: WebhookDeliveryLog | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJobInput {
  raw_input: string;
  document_name?: string;
  document_type?: string;
  webhook_url?: string;
  simulate_discrepancy?: boolean;
}

export interface JobFilterOptions {
  status?: JobStatus | "all";
  search?: string;
}
