export interface SampleDocument {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  badge: string;
  content: string;
  expectedBehavior: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: "nfe-cloud",
    title: "NF-e Serviços Cloud (AWS & DevOps)",
    category: "Infraestrutura Cloud & TI",
    subtitle: "Nota fiscal eletrônica de serviços de infraestrutura em nuvem",
    badge: "100% Válido",
    expectedBehavior: "Soma dos itens (R$ 8.450,00) confere perfeitamente com o total da nota.",
    content: `PREFEITURA MUNICIPAL DE SÃO PAULO - SECRETARIA DA FAZENDA
NOTA FISCAL ELETRÔNICA DE SERVIÇOS - NFS-e Nº 0004892
Data de Emissão: 15/02/2025 às 14:32:10
Código de Verificação: 8F2A-99B1-C4D8

PRESTADOR DE SERVIÇOS:
Razão Social: CLOUDSTACK TECNOLOGIA E INFRAESTRUTURA S.A.
Nome Fantasia: CloudStack Brasil
CNPJ: 28.491.730/0001-85
Inscrição Municipal: 5.892.114-0
Endereço: Av. Engenheiro Luís Carlos Berrini, 1052 - Itaim Bibi, São Paulo - SP

TOMADOR DE SERVIÇOS:
Razão Social: FINTECH SOLUCOES DIGITAIS LTDA
CNPJ: 34.120.987/0001-44
Endereço: Av. Paulista, 1842 - Bela Vista, São Paulo - SP

DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS:
1. Instâncias Computacionais Dedicadas (EC2 High-Memory 64GB) - Qtd: 3 un x R$ 1.650,00 = R$ 4.950,00
2. Banco de Dados Gerenciado PostgreSQL (Multi-AZ High Availability) - Qtd: 1 un x R$ 2.300,00 = R$ 2.300,00
3. Tráfego de Rede e Distribuição CDN (Edge Network Global 10TB) - Qtd: 1 un x R$ 1.200,00 = R$ 1.200,00

VALOR TOTAL DA NOTA FISCAL = R$ 8.450,00
Forma de Pagamento: Boleto Bancário 30 DDL
Retenções Federais: PIS/COFINS/CSLL retidos na fonte conforme Lei 10.833/03.`,
  },
  {
    id: "legal-contract",
    title: "Honorários de Assessoria Jurídica (LegalTech)",
    category: "Consultoria Jurídica",
    subtitle: "Relatório de horas e pareceres societários de escritório de advocacia",
    badge: "100% Válido",
    expectedBehavior: "Calcula horas x valor unitário e bate com o valor total dos honorários.",
    content: `DEMONSTRATIVO DE HONORÁRIOS E PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS
REF.: CONTRATO DE ASSESSORIA JURÍDICA SOCIETÁRIA Nº 2025/11
DATA DO RELATÓRIO: 10/01/2025

SOCIEDADE DE ADVOGADOS:
PINHEIRO, GUIMARÃES & ASSOCIADOS ADVOGADOS
CNPJ: 04.912.834/0001-19
OAB/SP Registro Coletivo nº 4.520
Alameda Santos, 2224, 15º andar - Cerqueira César, São Paulo - SP

CLIENTE:
NEXUS ENTERPRISE LOGISTICS S.A.
CNPJ: 19.832.401/0001-90

DETALHAMENTO DOS PARECERES E ATIVIDADES DO MÊS:
Item 1: Parecer de Due Diligence Regulatória e Auditoria de Compliance LGPD
Quantidade: 15 horas técnicas
Valor unitário por hora: R$ 420,00
Subtotal: R$ 6.300,00

Item 2: Elaboração e Revisão de Contrato de M&A e Acordo de Acionistas
Quantidade: 8 horas técnicas
Valor unitário por hora: R$ 550,00
Subtotal: R$ 4.400,00

Item 3: Representação em Audiência de Conciliação Trabalhista Estratégica
Quantidade: 2 sessões
Valor unitário: R$ 900,00
Subtotal: R$ 1.800,00

TOTAL CONSOLIDADO DOS SERVIÇOS: R$ 12.500,00
Dados bancários para transferência via PIX: juridico@pinheiroguimaraes.adv.br (Chave CNPJ)`,
  },
  {
    id: "discrepancy-finops",
    title: "Nota com Discrepância Matemática (Teste FinOps)",
    category: "Equipamentos de TI",
    subtitle: "Documento com divergência entre a soma dos itens e o total declarado",
    badge: "Alerta de Discrepância",
    expectedBehavior: "O motor identificará que a soma dos itens é R$ 5.920,00 mas o total declarado na nota é R$ 6.400,00 (diferença de R$ 480,00).",
    content: `CENTRAL SUPRIMENTOS E INFORMÁTICA CORPORATIVA LTDA
CNPJ: 17.842.391/0001-60
AV. BRIGADEIRO FARIA LIMA, 3400 - ITAIM BIBI - SÃO PAULO/SP
DANFE SIMPLIFICADA - EMISSÃO: 22/02/2025

DESTINATÁRIO:
STARTUP INOVACOES DIGITAIS LTDA
CNPJ: 45.102.394/0001-88

RELAÇÃO DE PRODUTOS FATURADOS:
- 4 un x Monitor Dell UltraSharp 27 4K (Ref U2723QE) a R$ 1.200,00 cada = R$ 4.800,00
- 2 un x Docking Station USB-C Thunderbolt 4 a R$ 560,00 cada = R$ 1.120,00

VALOR DECLARADO NO CAMPO TOTAL DA NOTA: R$ 6.400,00
(Atenção: Houve erro no preenchimento do cabeçalho da nota pelo fornecedor, inflando o total em R$ 480,00 a mais que a soma real de R$ 5.920,00)`,
  },
  {
    id: "saas-subscription",
    title: "Fatura SaaS Internacional (DevOps Tools)",
    category: "Licenciamento de Software SaaS",
    subtitle: "Invoice internacional de ferramentas de produtividade e engenharia",
    badge: "Moeda USD",
    expectedBehavior: "Extrai licenças por usuário e calcula o total faturado em USD.",
    content: `DEVTOOLS GLOBAL TECHNOLOGIES INC.
548 Market St, Suite 34920, San Francisco, CA 94104, USA
EIN / Tax ID: 94-3829104
INVOICE #INV-2025-08941
Issue Date: 2025-02-01
Due Date: 2025-02-15

Billed To:
TECHCORP ENGENHARIA E SOFTWARE S.A.
CNPJ/Tax ID: 21.908.432/0001-77
Belo Horizonte, MG - Brazil

ITEMS & SUBSCRIPTIONS:
1. Enterprise CI/CD Pipeline Runners (Dedicated Compute)
   Quantity: 5
   Unit Price: $120.00
   Item Total: $600.00

2. Team Security & Vulnerability Scanner (Seats)
   Quantity: 25
   Unit Price: $18.00
   Item Total: $450.00

3. Premium 24/7 SLA Support Add-on
   Quantity: 1
   Unit Price: $250.00
   Item Total: $250.00

TOTAL AMOUNT DUE: $1,300.00 USD
Payment method: Auto-charge to Corporate Visa **** 4920
Status: PAID`,
  },
];
