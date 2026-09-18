import { ExtractedDocument, ValidationDetails } from "@/lib/schema/document";

/**
 * Sanitiza e formata CNPJ ou CPF brasileiro se for possível
 */
export function sanitizeCnpjCpf(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 14) {
    // CNPJ: 00.000.000/0001-00
    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }
  if (digits.length === 11) {
    // CPF: 000.000.000-00
    return digits.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
  }
  return value.trim();
}

/**
 * Validação & Sanitização Matemática de Integridade (FinOps/Backoffice)
 * Regra do PRD: Valida se a soma dos itens coincide exatamente com o valor_total declarado.
 */
export function validateAndSanitizeDocument(
  doc: ExtractedDocument
): {
  sanitized: ExtractedDocument;
  validation: ValidationDetails;
  status: "valid" | "discrepancy";
} {
  const notes: string[] = [];

  // 1. Sanitização dos Itens e cálculo da soma ponderada
  let calculatedSum = 0;
  const sanitizedItens = doc.itens.map((item, index) => {
    const qty = Number(item.quantidade) || 1;
    const unitPrice = Number(item.valor_unitario) || 0;
    const itemTotal = Math.round(qty * unitPrice * 100) / 100;
    calculatedSum += itemTotal;

    return {
      ...item,
      descricao: item.descricao.trim(),
      quantidade: qty,
      valor_unitario: unitPrice,
      valor_total_item: itemTotal,
    };
  });

  calculatedSum = Math.round(calculatedSum * 100) / 100;
  const declaredTotal = Math.round((Number(doc.valor_total) || 0) * 100) / 100;
  const diff = Math.round(Math.abs(calculatedSum - declaredTotal) * 100) / 100;

  // Tolerância de centavos para arredondamento fiscal (R$ 0.05)
  const isValid = diff <= 0.05;

  let discrepancyAlert: string | null = null;

  if (isValid) {
    notes.push(
      `Conformidade Fiscal: Soma calculada dos itens (${doc.moeda} ${calculatedSum.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 }
      )}) confere rigorosamente com o valor total declarado (${doc.moeda} ${declaredTotal.toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 }
      )}).`
    );
  } else {
    const direction = calculatedSum > declaredTotal ? "superior" : "inferior";
    discrepancyAlert = `Discrepância FinOps detectada! A soma calculada dos itens (${doc.moeda} ${calculatedSum.toLocaleString(
      "pt-BR",
      { minimumFractionDigits: 2 }
    )}) é ${direction} ao valor total declarado (${doc.moeda} ${declaredTotal.toLocaleString(
      "pt-BR",
      { minimumFractionDigits: 2 }
    )}). Diferença: ${doc.moeda} ${diff.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}.`;
    notes.push(discrepancyAlert);
  }

  // Sanitização de Entidade / CNPJ / Categoria
  const sanitizedDoc: ExtractedDocument = {
    ...doc,
    emissor: doc.emissor.trim(),
    cnpj_cpf: sanitizeCnpjCpf(doc.cnpj_cpf),
    categoria: doc.categoria.trim() || "Despesas Gerais",
    valor_total: declaredTotal,
    itens: sanitizedItens,
  };

  const validation: ValidationDetails = {
    calculated_sum: calculatedSum,
    declared_total: declaredTotal,
    difference: diff,
    is_valid: isValid,
    notes,
    discrepancy_alert: discrepancyAlert,
  };

  return {
    sanitized: sanitizedDoc,
    validation,
    status: isValid ? "valid" : "discrepancy",
  };
}
