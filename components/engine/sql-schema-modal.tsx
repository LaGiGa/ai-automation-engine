"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileCode2, Copy, Check, Database } from "lucide-react";

interface SqlSchemaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SqlSchemaModal({ open, onOpenChange }: SqlSchemaModalProps) {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Tabela de Jobs do AI Automation Engine (PostgreSQL / Supabase)
create extension if not exists "uuid-ossp";

create table if not exists public.processing_jobs (
  id uuid default gen_random_uuid() primary key,
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  document_name text not null default 'documento_fiscal.txt',
  document_type text default 'documento',
  raw_input text not null,
  extracted_data jsonb,
  validation_status text check (validation_status in ('valid', 'discrepancy', 'failed', 'skipped')) default 'skipped',
  validation_details jsonb,
  webhook_status text not null check (webhook_status in ('idle', 'pending', 'success', 'failed', 'simulated')) default 'idle',
  webhook_url text,
  webhook_response jsonb,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices de alta performance para status e consultas no campo JSONB
create index if not exists idx_processing_jobs_status on public.processing_jobs(status);
create index if not exists idx_processing_jobs_created_at on public.processing_jobs(created_at desc);
create index if not exists idx_processing_jobs_extracted_data_gin on public.processing_jobs using gin (extracted_data);

-- Habilitar Row Level Security (RLS)
alter table public.processing_jobs enable row level security;

create policy "Allow public read processing_jobs"
  on public.processing_jobs for select using (true);

create policy "Allow public insert processing_jobs"
  on public.processing_jobs for insert with check (true);

create policy "Allow public update processing_jobs"
  on public.processing_jobs for update using (true);

create policy "Allow public delete processing_jobs"
  on public.processing_jobs for delete using (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-zinc-900">
                  Esquema PostgreSQL (Supabase DDL)
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Estrutura da tabela `processing_jobs` com campo JSONB e índices GIN
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
                  Copiar Script SQL
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="my-2">
          <p className="text-xs text-zinc-600 mb-2 leading-relaxed">
            Execute o script abaixo no <strong>SQL Editor</strong> do painel do seu projeto Supabase para criar a tabela de jobs, índices GIN de consulta em JSONB e regras de segurança:
          </p>

          <pre className="p-4 rounded-xl bg-zinc-900 text-emerald-300 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800 shadow-inner">
            <code>{sqlScript}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
