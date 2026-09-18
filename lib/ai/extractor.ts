import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { ExtractedDocument, ExtractedDocumentSchema } from "@/lib/schema/document";

const SYSTEM_INSTRUCTION = `Você é um motor corporativo de automação de documentos e auditoria fiscal (FinOps & LegalTech).
Sua missão é ler documentos desestruturados (notas fiscais, recibos, faturas de serviços, contratos, relatórios financeiros ou invoices internacionais) e extrair os dados com precisão cirúrgica de acordo com o JSON Schema estrito.

Regras de Extração:
1. "emissor": Identifique a entidade, empresa prestadora, razão social ou profissional que emitiu o documento.
2. "cnpj_cpf": Extraia o CNPJ ou CPF do emissor. Se não houver explícito, deduza do cabeçalho ou insira "Não informado".
3. "data_emissao": Extraia a data em que o documento foi emitido.
4. "valor_total": Extraia o valor total final da nota/fatura como NÚMERO decimal puro (sem símbolos de moeda como R$ ou US$). Exemplo: 1250.50.
5. "categoria": Classifique com precisão na categoria contábil mais apropriada (ex: "Infraestrutura Cloud & TI", "Consultoria Jurídica", "Licenciamento de Software SaaS", "Suprimentos & Hardware", "Serviços de Telecomunicações", "Facilities & Manutenção").
6. "itens": Extraia TODOS os itens discriminados. Para cada item:
   - "descricao": Nome ou especificação do produto/serviço
   - "quantidade": Número de unidades faturadas (padrão 1 se não especificado)
   - "valor_unitario": Preço unitário em número decimal
7. "moeda": "BRL" para Reais brasileiros, "USD" para dólares americanos, ou correspondente.
8. Mantenha estrita fidelidade aos números do documento original. Nunca invente dados não mencionados.`;

export async function extractDocumentData(
  input: {
    rawText: string;
    imageBase64?: string;
    imageMimeType?: string;
  }
): Promise<ExtractedDocument> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. Preferred Primary Engine: Gemini API 3.8 Flash via @google/genai
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "ai-automation-engine/1.0",
          },
        },
      });

      const contents: Array<any> = [];

      if (input.imageBase64 && input.imageMimeType) {
        contents.push({
          inlineData: {
            mimeType: input.imageMimeType,
            data: input.imageBase64,
          },
        });
      }

      const promptText = `Analise o seguinte documento fiscal/corporativo e extraia rigorosamente os campos exigidos em JSON estruturado:\n\n--- INÍCIO DO DOCUMENTO ---\n${input.rawText}\n--- FIM DO DOCUMENTO ---`;
      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents.length === 1 ? contents[0].text : { parts: contents },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emissor: {
                type: Type.STRING,
                description: "Razão social ou nome do emissor/entidade",
              },
              cnpj_cpf: {
                type: Type.STRING,
                description: "CNPJ ou CPF do emissor",
              },
              data_emissao: {
                type: Type.STRING,
                description: "Data de emissão (ex: AAAA-MM-DD ou DD/MM/AAAA)",
              },
              valor_total: {
                type: Type.NUMBER,
                description: "Valor total líquido/bruto do documento faturado",
              },
              categoria: {
                type: Type.STRING,
                description: "Categoria contábil ou financeira da despesa",
              },
              itens: {
                type: Type.ARRAY,
                description: "Lista de itens ou serviços faturados",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    descricao: {
                      type: Type.STRING,
                      description: "Descrição do produto ou serviço",
                    },
                    quantidade: {
                      type: Type.NUMBER,
                      description: "Quantidade faturada",
                    },
                    valor_unitario: {
                      type: Type.NUMBER,
                      description: "Preço unitário decimal do item",
                    },
                  },
                  required: ["descricao", "quantidade", "valor_unitario"],
                },
              },
              moeda: {
                type: Type.STRING,
                description: "Código da moeda (ex: BRL, USD)",
              },
              numero_documento: {
                type: Type.STRING,
                description: "Número identificador da nota ou fatura",
              },
              observacoes: {
                type: Type.STRING,
                description: "Observações ou termos complementares",
              },
            },
            required: [
              "emissor",
              "cnpj_cpf",
              "data_emissao",
              "valor_total",
              "categoria",
              "itens",
            ],
          },
        },
      });

      const responseText = response.text || "{}";
      const parsedJson = JSON.parse(responseText.trim());
      // Validação rigorosa com Zod
      return ExtractedDocumentSchema.parse(parsedJson);
    } catch (err) {
      console.warn("Gemini extraction error, checking fallback:", err);
      if (!openaiApiKey) {
        throw new Error(
          `Falha na extração de dados via Gemini API: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  // 2. Secondary Engine: OpenAI API Structured Outputs
  if (openaiApiKey && openaiApiKey !== "sk-...") {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        {
          role: "user",
          content: `Extraia os dados em JSON seguindo o schema rigoroso:\n\n${input.rawText}`,
        },
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return ExtractedDocumentSchema.parse(parsed);
  }

  throw new Error(
    "Nenhuma chave de IA válida (GEMINI_API_KEY ou OPENAI_API_KEY) está configurada no ambiente."
  );
}
