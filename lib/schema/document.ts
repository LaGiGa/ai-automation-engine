import { z } from "zod";

/**
 * Item individual extraído de uma fatura, nota fiscal ou contrato
 */
export const ExtractedItemSchema = z.object({
  descricao: z
    .string()
    .describe("Descrição detalhada do produto, serviço ou encargo listado no documento"),
  quantidade: z
    .number()
    .describe("Quantidade numérica de itens ou unidades faturadas"),
  valor_unitario: z
    .number()
    .describe("Preço ou valor monetário unitário do item em número decimal (ex: 150.50)"),
  valor_total_item: z
    .number()
    .optional()
    .describe("Subtotal do item (quantidade * valor_unitario), se declarado ou calculado"),
});

export type ExtractedItem = z.infer<typeof ExtractedItemSchema>;

/**
 * Schema principal exigido pelo PRD:
 * { emissor, cnpj_cpf, data_emissao, valor_total, itens: [{ descricao, quantidade, valor_unitario }], categoria }
 */
export const ExtractedDocumentSchema = z.object({
  emissor: z
    .string()
    .describe("Razão social, nome da empresa, prestador ou entidade emissora do documento"),
  cnpj_cpf: z
    .string()
    .describe("CNPJ ou CPF do emissor devidamente formatado ou identificado (ex: 00.000.000/0001-00)"),
  data_emissao: z
    .string()
    .describe("Data de emissão do documento no formato AAAA-MM-DD ou DD/MM/AAAA"),
  valor_total: z
    .number()
    .describe("Valor total final líquido/bruto faturado no documento em número decimal"),
  categoria: z
    .string()
    .describe("Categoria contábil/financeira (ex: Infraestrutura Cloud, Licenciamento de Software, Consultoria Jurídica, Equipamentos de TI, Telecomunicações, Facilities)"),
  itens: z
    .array(ExtractedItemSchema)
    .min(1, "A lista de itens deve conter pelo menos um item")
    .describe("Lista discriminada de itens, produtos ou serviços prestados"),
  moeda: z
    .string()
    .default("BRL")
    .describe("Moeda do documento (ex: BRL, USD, EUR)"),
  numero_documento: z
    .string()
    .optional()
    .describe("Número da nota fiscal, fatura, recibo ou contrato"),
  observacoes: z
    .string()
    .optional()
    .describe("Termos de pagamento, vencimento ou notas fiscais complementares"),
});

export type ExtractedDocument = z.infer<typeof ExtractedDocumentSchema>;

/**
 * Interface para auditoria e validação matemática de integridade
 */
export interface ValidationDetails {
  calculated_sum: number;
  declared_total: number;
  difference: number;
  is_valid: boolean;
  notes: string[];
  discrepancy_alert?: string | null;
}
