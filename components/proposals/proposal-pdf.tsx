import path from "node:path";

import {
  Document,
  Font,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import {
  formatModuleType,
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
  formatUnitType,
} from "@/lib/utils/proposals";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 32,
    paddingBottom: 70,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: "#0f172a",
  },
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  logoBlock: {
    width: "58%",
  },
  logo: {
    width: 230,
    height: 66,
    objectFit: "contain",
    marginBottom: 6,
  },
  headerMeta: {
    width: "42%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 10,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 22,
    marginBottom: 4,
    color: "#0f172a",
  },
  proposalCode: {
    fontSize: 17,
    color: "#1d4ed8",
  },
  metaTitle: {
    fontSize: 15,
    marginBottom: 6,
    color: "#0f172a",
  },
  metaLine: {
    fontSize: 8.5,
    color: "#475569",
    marginBottom: 3,
  },
  section: {
    marginBottom: 10,
  },
  pdfSection: {
    marginBottom: 10,
    paddingTop: 0,
  },
  scopeTableSection: {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 11,
    backgroundColor: "#ffffff",
  },
  sectionSoftCard: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 10,
    padding: 11,
    backgroundColor: "#f8fafc",
  },
  sectionTitle: {
    fontSize: 10,
    marginBottom: 7,
    color: "#1e40af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  twoCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  col: {
    width: "48%",
  },
  fieldGroup: {
    marginBottom: 5,
  },
  label: {
    fontSize: 7.5,
    color: "#64748b",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 9.5,
    color: "#0f172a",
  },
  valueStrong: {
    fontSize: 12,
    color: "#0f172a",
  },
  bodyText: {
    fontSize: 9.2,
    lineHeight: 1.3,
    color: "#334155",
  },
  compactScopeCard: {
    padding: 10,
  },
  compactScopeText: {
    fontSize: 9,
    lineHeight: 1.2,
    color: "#334155",
  },
  configGrid: {
    flexDirection: "row",
    gap: 10,
  },
  configCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },
  configLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  configValue: {
    fontSize: 16,
    color: "#1d4ed8",
    textAlign: "center",
  },
  financialBox: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
  },
  financialHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
  },
  financialHeaderLabel: {
    width: "70%",
    padding: 10,
    fontSize: 10,
    color: "#ffffff",
  },
  financialHeaderValue: {
    width: "30%",
    padding: 10,
    fontSize: 10,
    color: "#ffffff",
    textAlign: "right",
  },
  financialRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  financialLabel: {
    width: "70%",
    padding: 10,
    fontSize: 10,
    color: "#334155",
  },
  financialValue: {
    width: "30%",
    padding: 10,
    fontSize: 10,
    color: "#0f172a",
    textAlign: "right",
  },
  financialTotalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  financialTotalLabel: {
    width: "70%",
    padding: 12,
    fontSize: 11,
    color: "#1e40af",
  },
  financialTotalValue: {
    width: "30%",
    padding: 12,
    fontSize: 11,
    color: "#1e40af",
    textAlign: "right",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  financialSectionBreak: {
    marginTop: 32,
  },
  summaryCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  summaryCardEmphasis: {
    borderColor: "#dbeafe",
    backgroundColor: "#eff6ff",
  },
  summaryCardTotal: {
    borderColor: "#bbf7d0",
    backgroundColor: "#ecfdf5",
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    color: "#0f172a",
  },
  tableBox: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  tableHeaderGroup: {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
  tableRowGroup: {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
  colModule: {
    width: "30%",
    padding: 7,
    fontSize: 8.5,
  },
  colQuantity: {
    width: "12%",
    padding: 7,
    fontSize: 8.5,
  },
  colUnit: {
    width: "14%",
    padding: 7,
    fontSize: 8.5,
  },
  colRange: {
    width: "10%",
    padding: 7,
    fontSize: 8.5,
  },
  colMonthly: {
    width: "17%",
    padding: 7,
    fontSize: 8.5,
    textAlign: "right",
  },
  colSetup: {
    width: "17%",
    padding: 7,
    fontSize: 8.5,
    textAlign: "right",
  },
  tableHeaderText: {
    color: "#ffffff",
  },
  notesText: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#334155",
  },
  termsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  termsCol: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    padding: 12,
  },
  termsTitle: {
    fontSize: 10,
    marginBottom: 8,
    color: "#1e40af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#475569",
  },
  footer: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLine: {
    fontSize: 8,
    color: "#64748b",
  },
  aboutGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  aboutLeft: {
    width: "44%",
  },
  aboutRight: {
    width: "56%",
  },
  emphasisBox: {
    marginTop: 14,
    borderRadius: 10,
    backgroundColor: "#0f172a",
    padding: 14,
  },
  emphasisText: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#ffffff",
  },
  bulletList: {
    marginTop: 10,
  },
  bulletItem: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#334155",
    marginBottom: 5,
  },
  aboutSection: {
    paddingTop: 32,
    marginBottom: 14,
  },
  acceptanceSection: {
    paddingTop: 32,
  },
  acceptanceCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  signatureField: {
    marginTop: 16,
    marginBottom: 12,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 8,
  },
  signatureLine: {
    height: 28,
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
  },
  signatureLineShort: {
    height: 28,
    width: "60%",
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
  },
  signatureBox: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 16,
  },
  signatureArea: {
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
  },
  signatureCaption: {
    marginTop: 10,
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
  },
});

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

const DEFAULT_PDF_SCOPE_DESCRIPTION =
  "A presente proposta contempla a implantação e operação do Partsec One para centralizar monitoramento, visibilidade operacional e suporte gerenciado de ativos críticos, endpoints e serviços em nuvem.";

function getPdfScopeDescription(scopeDescription?: string | null) {
  const normalized = scopeDescription?.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return DEFAULT_PDF_SCOPE_DESCRIPTION;
  }

  return normalized.length > 180 ? DEFAULT_PDF_SCOPE_DESCRIPTION : normalized;
}

function groupRowsForPdf<T>(items: T[]) {
  const groups: T[][] = [];

  for (let index = 0; index < items.length; index += 2) {
    groups.push(items.slice(index, index + 2));
  }

  const lastGroup = groups[groups.length - 1];

  if (lastGroup?.length === 1 && groups.length > 1) {
    const previousGroup = groups[groups.length - 2];
    previousGroup.push(lastGroup[0]);
    groups.pop();
  }

  return groups;
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function resolveLogoPath() {
  return path.join(process.cwd(), "public", "brand", "partsec-logo.png");
}

type ProposalPDFProps = {
  proposal: {
    proposalNumber: number;
    title: string;
    status: string;
    plan: string;
    activeCount: number;
    subtotal: unknown;
    discountPercent: unknown;
    discountValue: unknown;
    total: unknown;
    setupFee: unknown;
    monthlySubtotal: unknown;
    setupSubtotal: unknown;
    discountAmount: unknown;
    finalMonthlyPrice: unknown;
    finalSetupPrice: unknown;
    firstMonthTotal: unknown;
    validityDays: number;
    notes: string | null;
    scopeDescription: string | null;
    createdAt: Date | string;
    customer: {
      companyName: string;
      tradeName: string | null;
      document: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string | null;
    };
    partner: {
      name: string;
      email: string | null;
      phone?: string | null;
      tradeName?: string | null;
      document?: string | null;
    };
    items?: Array<{
      id: string;
      moduleType: string;
      unitType: string;
      description: string | null;
      quantity: number;
      rangeLabel: string;
      monthlyPrice: unknown;
      setupPrice: unknown;
    }>;
  };
};

function getDisplayItems(proposal: ProposalPDFProps["proposal"]) {
  if (proposal.items && proposal.items.length > 0) {
    return proposal.items.map((item) => ({
      id: item.id,
      moduleLabel: item.description?.trim() || formatModuleType(item.moduleType),
      quantity: item.quantity,
      unitLabel: formatUnitType(item.unitType),
      rangeLabel: item.rangeLabel,
      monthlyPrice: item.monthlyPrice,
      setupPrice: item.setupPrice,
    }));
  }

  return [
    {
      id: "legacy-scope",
      moduleLabel: "Infraestrutura",
      quantity: proposal.activeCount,
      unitLabel: "ativos",
      rangeLabel: "Legado",
      monthlyPrice: proposal.subtotal,
      setupPrice: proposal.setupFee,
    },
  ];
}

function getFinancialSummary(proposal: ProposalPDFProps["proposal"]) {
  const hasItems = Boolean(proposal.items && proposal.items.length > 0);

  if (hasItems) {
    return {
      monthlySubtotal: proposal.monthlySubtotal,
      discountPercent: proposal.discountPercent,
      discountAmount: proposal.discountAmount,
      finalMonthlyPrice: proposal.finalMonthlyPrice,
      finalSetupPrice: proposal.finalSetupPrice,
      firstMonthTotal: proposal.firstMonthTotal,
      usesLegacyFallback: false,
    };
  }

  const finalMonthlyPrice = Number(proposal.total || 0);
  const finalSetupPrice = Number(proposal.setupFee || 0);

  return {
    monthlySubtotal: proposal.subtotal,
    discountPercent: proposal.discountPercent,
    discountAmount: proposal.discountValue,
    finalMonthlyPrice,
    finalSetupPrice,
    firstMonthTotal: finalMonthlyPrice + finalSetupPrice,
    usesLegacyFallback: true,
  };
}

export function ProposalPDF({ proposal }: ProposalPDFProps) {
  const notesText =
    proposal.notes?.trim() ||
    `Para a habilitação do serviço (enabling), será necessário o alinhamento com a equipe técnica do cliente para o fornecimento dos acessos de coleta de informações (API, syslog, SNMP, etc).

O prazo para a finalização da implementação é de até 30 dias corridos a partir do aceite formal da proposta.`;
  const displayItems = getDisplayItems(proposal);
  const scopeDescription = getPdfScopeDescription(proposal.scopeDescription);
  const keepScopeTableTogether = displayItems.length <= 5;
  const headerGroupItems = keepScopeTableTogether
    ? []
    : displayItems.slice(0, Math.min(2, displayItems.length));
  const remainingDisplayItems = keepScopeTableTogether
    ? displayItems
    : displayItems.slice(headerGroupItems.length);
  const displayItemGroups = groupRowsForPdf(remainingDisplayItems);
  const financial = getFinancialSummary(proposal);
  const renderScopeRow = (item: (typeof displayItems)[number]) => (
    <View key={item.id} style={styles.tableRow} wrap={false}>
      <Text style={styles.colModule}>{item.moduleLabel}</Text>
      <Text style={styles.colQuantity}>{item.quantity}</Text>
      <Text style={styles.colUnit}>{item.unitLabel}</Text>
      <Text style={styles.colRange}>{item.rangeLabel}</Text>
      <Text style={styles.colMonthly}>{formatCurrency(item.monthlyPrice)}</Text>
      <Text style={styles.colSetup}>{formatCurrency(item.setupPrice)}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />

        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logoBlock}>
              <Image style={styles.logo} src={resolveLogoPath()} />
              <Text style={styles.title}>PROPOSTA COMERCIAL</Text>
              <Text style={styles.proposalCode}>
                {formatProposalNumber(
                  proposal.proposalNumber,
                  proposal.createdAt
                )}
              </Text>
            </View>

            <View style={styles.headerMeta}>
              <Text style={styles.metaTitle}>{proposal.title}</Text>
              <Text style={styles.metaLine}>
                Cliente: {proposal.customer.companyName}
              </Text>
              <Text style={styles.metaLine}>
                Plano: {formatProposalPlan(proposal.plan)}
              </Text>
              <Text style={styles.metaLine}>
                Status: {formatProposalStatus(proposal.status)}
              </Text>
              <Text style={styles.metaLine}>
                Data: {formatDate(proposal.createdAt)}
              </Text>
              <Text style={styles.metaLine}>
                Validade: {proposal.validityDays} dias
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.twoCols]}>
          <View style={[styles.col, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>Cliente</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Razão social</Text>
              <Text style={styles.valueStrong}>
                {proposal.customer.companyName}
              </Text>
            </View>

            {proposal.customer.tradeName ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome fantasia</Text>
                <Text style={styles.value}>{proposal.customer.tradeName}</Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contato</Text>
              <Text style={styles.value}>{proposal.customer.contactName}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <Text style={styles.value}>{proposal.customer.contactEmail}</Text>
            </View>
          </View>

          <View style={[styles.col, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>Dados gerais</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Número da proposta</Text>
              <Text style={styles.valueStrong}>
                {formatProposalNumber(
                  proposal.proposalNumber,
                  proposal.createdAt
                )}
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Título</Text>
              <Text style={styles.value}>{proposal.title}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Plano contratado</Text>
              <Text style={styles.value}>{formatProposalPlan(proposal.plan)}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>{formatProposalStatus(proposal.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionSoftCard}>
          <Text style={styles.sectionTitle}>Sobre a solução</Text>
          <Text style={styles.bodyText}>
            O Partsec One centraliza monitoramento, visibilidade operacional e
            informações de TI e segurança em uma visão única, apoiando a
            operação com mais agilidade, padronização e produtividade.
          </Text>
        </View>

        <View style={[styles.section, { marginTop: 8 }]}>
          <View style={[styles.sectionSoftCard, styles.compactScopeCard]}>
            <Text style={styles.sectionTitle}>Escopo desta proposta</Text>
            <Text style={styles.compactScopeText}>{scopeDescription}</Text>
          </View>
        </View>

        <View
          style={[
            styles.pdfSection,
            ...(keepScopeTableTogether ? [styles.scopeTableSection] : []),
          ]}
          wrap={!keepScopeTableTogether}
        >
          <Text style={styles.sectionTitle}>Escopo contratado</Text>

          <View style={styles.tableBox}>
            <View
              style={
                headerGroupItems.length > 0
                  ? styles.tableHeaderGroup
                  : undefined
              }
              wrap={headerGroupItems.length > 0 ? false : true}
            >
              <View style={styles.tableHeader}>
                <Text style={[styles.colModule, styles.tableHeaderText]}>Módulo</Text>
                <Text style={[styles.colQuantity, styles.tableHeaderText]}>Qtd.</Text>
                <Text style={[styles.colUnit, styles.tableHeaderText]}>Unidade</Text>
                <Text style={[styles.colRange, styles.tableHeaderText]}>Faixa</Text>
                <Text style={[styles.colMonthly, styles.tableHeaderText]}>Mensalidade</Text>
                <Text style={[styles.colSetup, styles.tableHeaderText]}>Setup</Text>
              </View>

              {headerGroupItems.map(renderScopeRow)}
            </View>

            {displayItemGroups.map((group) => (
              <View
                key={group.map((item) => item.id).join("-")}
                style={styles.tableRowGroup}
                wrap={false}
              >
                {group.map(renderScopeRow)}
              </View>
            ))}
          </View>

          {financial.usesLegacyFallback ? (
            <Text style={[styles.metaLine, { marginTop: 8 }]}>
              Proposta legada sem itens estruturados: exibindo fallback de
              infraestrutura.
            </Text>
          ) : null}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLine}>www.partsec.com.br</Text>
          <Text style={styles.footerLine}>comercial@partsec.com.br</Text>
          <Text style={styles.footerLine}>+55 51 99329-6675</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />

        <View style={[styles.section, styles.financialSectionBreak]}>
          <Text style={styles.sectionTitle}>Resumo financeiro</Text>

          <View style={styles.summaryGrid} wrap={false}>
            <View style={[styles.summaryCard, styles.summaryCardEmphasis]}>
              <Text style={styles.summaryLabel}>Mensalidade recorrente final</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(financial.finalMonthlyPrice)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Setup / implantação</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(financial.finalSetupPrice)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.summaryCardTotal]}>
              <Text style={styles.summaryLabel}>Total do primeiro mês</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(financial.firstMonthTotal)}
              </Text>
            </View>
          </View>

          <View style={styles.financialBox} wrap={false}>
            <View style={styles.financialHeader}>
              <Text style={styles.financialHeaderLabel}>Descrição</Text>
              <Text style={styles.financialHeaderValue}>Valor</Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Mensalidade bruta</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(financial.monthlySubtotal)}
              </Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>
                Desconto aplicado ({Number(financial.discountPercent)}%)
              </Text>
              <Text style={styles.financialValue}>
                - {formatCurrency(financial.discountAmount)}
              </Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>
                Mensalidade recorrente final
              </Text>
              <Text style={styles.financialValue}>
                {formatCurrency(financial.finalMonthlyPrice)}
              </Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Implantação / setup</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(financial.finalSetupPrice)}
              </Text>
            </View>

            <View style={styles.financialTotalRow}>
              <Text style={styles.financialTotalLabel}>Total do primeiro mês</Text>
              <Text style={styles.financialTotalValue}>
                {formatCurrency(financial.firstMonthTotal)}
              </Text>
            </View>
          </View>

          <View style={[styles.sectionSoftCard, { marginTop: 12 }]} wrap={false}>
            <Text style={styles.bodyText}>
              O valor mensal corresponde à recorrência do serviço contratado. O
              valor de implantação/setup é cobrado no primeiro mês, conforme
              escopo definido nesta proposta.
            </Text>
          </View>
        </View>

        <View style={styles.sectionSoftCard} wrap={false}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.notesText}>{notesText}</Text>
        </View>

        <View style={[styles.section, { marginTop: 14 }]}>
          <View style={styles.termsGrid}>
            <View style={styles.termsCol}>
              <Text style={styles.termsTitle}>Validade da proposta</Text>
              <Text style={styles.termsText}>
                Esta proposta é válida por {proposal.validityDays} dias corridos
                a partir da data de emissão.
              </Text>
            </View>

            <View style={styles.termsCol}>
              <Text style={styles.termsTitle}>Condições comerciais</Text>
              <Text style={styles.termsText}>
                Os valores apresentados contemplam o escopo descrito nesta
                proposta. O setup inicial é cobrado em parcela única e a
                mensalidade refere-se à recorrência do serviço. Quaisquer
                alterações de escopo poderão implicar revisão comercial. O
                início da operação está condicionado ao aceite da proposta e ao
                alinhamento de implantação.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLine}>www.partsec.com.br</Text>
          <Text style={styles.footerLine}>comercial@partsec.com.br</Text>
          <Text style={styles.footerLine}>+55 51 99329-6675</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />

        <View style={[styles.section, styles.aboutSection]} wrap={false}>
          <View style={styles.sectionSoftCard}>
            <Text style={styles.sectionTitle}>Sobre a Partsec</Text>

            <Text style={styles.bodyText}>
              A Partsec é uma empresa brasileira especializada em monitoramento,
              visibilidade e resposta para ambientes de TI e Segurança.
              {"\n\n"}
              Combinamos tecnologia, automação e inteligência para entregar
              operações mais eficientes, seguras e resilientes.
            </Text>

            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Monitoramento 24x7</Text>
              <Text style={styles.bulletItem}>• Visibilidade unificada</Text>
              <Text style={styles.bulletItem}>• Resposta rápida e assertiva</Text>
              <Text style={styles.bulletItem}>
                • Relatórios e indicadores inteligentes
              </Text>
              <Text style={styles.bulletItem}>
                • Equipe especialista e certificada
              </Text>
            </View>

            <View style={styles.emphasisBox}>
              <Text style={styles.emphasisText}>
                Nosso propósito é transformar dados em ação para que nossos clientes
                operem com confiança e foco no que realmente importa.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.acceptanceSection} wrap={false}>
          <View style={styles.acceptanceCard}>
            <Text style={styles.sectionTitle}>Aceite da proposta</Text>

            <Text style={styles.bodyText}>
              Ao assinar abaixo, o cliente declara que está de acordo com os termos e
              condições desta proposta comercial.
            </Text>

            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Empresa / Cliente:</Text>
              <View style={styles.signatureLine} />
            </View>

            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Nome do responsável:</Text>
              <View style={styles.signatureLine} />
            </View>

            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Cargo:</Text>
              <View style={styles.signatureLineShort} />
            </View>

            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Data:</Text>
              <View style={styles.signatureLineShort} />
            </View>

            <View style={styles.signatureBox}>
              <View style={styles.signatureArea} />
              <Text style={styles.signatureCaption}>
                Assinatura do responsável
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerLine}>www.partsec.com.br</Text>
          <Text style={styles.footerLine}>comercial@partsec.com.br</Text>
          <Text style={styles.footerLine}>+55 51 99329-6675</Text>
        </View>
      </Page>
    </Document>
  );
}
