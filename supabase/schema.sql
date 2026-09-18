-- ==========================================================
-- PROJETO 02: AI Automation Engine (Pipeline de Extração Estruturada)
-- Database Migration Script (PostgreSQL / Supabase)
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================================
-- 1. PROCESSING_JOBS TABLE
-- ==========================================================
-- processing_jobs: id (uuid), status (text: 'pending' | 'processing' | 'completed' | 'failed'),
-- raw_input (text), extracted_data (jsonb), webhook_status (text), created_at.
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

-- Indexes for performance and JSONB queries
create index if not exists idx_processing_jobs_status on public.processing_jobs(status);
create index if not exists idx_processing_jobs_webhook_status on public.processing_jobs(webhook_status);
create index if not exists idx_processing_jobs_created_at on public.processing_jobs(created_at desc);

-- GIN index for querying inside extracted_data JSONB (ex: emissor, categoria, valor_total)
create index if not exists idx_processing_jobs_extracted_data_gin on public.processing_jobs using gin (extracted_data);

-- ==========================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================================
alter table public.processing_jobs enable row level security;

-- Permite leitura e gravação no dashboard corporativo
create policy "Allow public read processing_jobs"
  on public.processing_jobs for select
  using (true);

create policy "Allow public insert processing_jobs"
  on public.processing_jobs for insert
  with check (true);

create policy "Allow public update processing_jobs"
  on public.processing_jobs for update
  using (true);

create policy "Allow public delete processing_jobs"
  on public.processing_jobs for delete
  using (true);

-- ==========================================================
-- 3. TRIGGER TO AUTO-UPDATE updated_at
-- ==========================================================
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_set_updated_at on public.processing_jobs;
create trigger trigger_set_updated_at
  before update on public.processing_jobs
  for each row execute procedure public.set_current_timestamp_updated_at();

-- ==========================================================
-- 4. SEED SAMPLE DATA (Opcional para testes manuais no SQL Editor)
-- ==========================================================
insert into public.processing_jobs (
  id,
  status,
  document_name,
  raw_input,
  extracted_data,
  validation_status,
  validation_details,
  webhook_status,
  webhook_url
) values (
  '11111111-1111-1111-1111-111111111111',
  'completed',
  'NF-e_CloudStack_4892.txt',
  'NFS-e 4892 - CLOUDSTACK TECNOLOGIA. Instâncias EC2: 3 x 1650.00. Total: R$ 8.450,00',
  '{"emissor": "CLOUDSTACK TECNOLOGIA S.A.", "cnpj_cpf": "28.491.730/0001-85", "data_emissao": "2025-02-15", "valor_total": 8450.00, "categoria": "Infraestrutura Cloud & TI", "itens": [{"descricao": "Instâncias Computacionais EC2", "quantidade": 3, "valor_unitario": 1650.00, "valor_total_item": 4950.00}]}'::jsonb,
  'valid',
  '{"calculated_sum": 8450.00, "declared_total": 8450.00, "difference": 0.00, "is_valid": true, "notes": ["Conformidade Fiscal Verificada"]}'::jsonb,
  'simulated',
  'https://api.empresa.com/v1/erp/webhooks/invoices'
) on conflict (id) do nothing;
