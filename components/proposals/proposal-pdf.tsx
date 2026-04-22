import path from "node:path";

import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import {
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
} from "@/lib/utils/proposals";

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingHorizontal: 32,
    paddingBottom: 56,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  topBar: {
    height: 10,
    backgroundColor: "#0f172a",
    marginBottom: 14,
    marginHorizontal: -32,
  },

  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  logoBlock: {
    width: "52%",
  },

  logo: {
    width: 120,
    height: 36,
    objectFit: "contain",
    marginBottom: 6,
  },

  headerMeta: {
    width: "48%",
    alignItems: "flex-end",
  },

  title: {
    fontSize: 17,
    marginBottom: 3,
  },

  proposalCode: {
    fontSize: 9,
    color: "#2563eb",
    marginBottom: 6,
  },

  metaLine: {
    fontSize: 8.5,
    color: "#475569",
    marginBottom: 2,
    textAlign: "right",
  },

  section: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  sectionTitle: {
    fontSize: 9.5,
    marginBottom: 6,
    color: "#334155",
  },

  twoCols: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  col: {
    width: "48%",
  },

  label: {
    fontSize: 7.5,
    color: "#64748b",
    marginBottom: 1,
  },

  value: {
    fontSize: 8.5,
    marginBottom: 4,
  },

  highlightGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },

  highlightCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    padding: 6,
  },

  highlightLabel: {
    fontSize: 7.5,
    color: "#64748b",
    marginBottom: 2,
  },

  highlightValue: {
    fontSize: 9,
  },

  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
  },

  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  cellLabel: {
    width: "70%",
    padding: 5,
    fontSize: 8.5,
  },

  cellValue: {
    width: "30%",
    padding: 5,
    fontSize: 8.5,
    textAlign: "right",
  },

  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },

  totalLabel: {
    width: "70%",
    padding: 7,
    fontSize: 9,
  },

  totalValue: {
    width: "30%",
    padding: 7,
    fontSize: 9,
    textAlign: "right",
  },

  noteBox: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    padding: 6,
  },

  notesSection: {
    marginTop: 2,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  footer: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },

  footerLine: {
    fontSize: 7.5,
    color: "#64748b",
    marginBottom: 1,
  },

  descriptionBox: {
    marginBottom: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },

  descriptionTitle: {
    fontSize: 9.5,
    marginBottom: 5,
    color: "#334155",
  },

  descriptionText: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: "#334155",
  },

  scopeBox: {
    marginBottom: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },

  scopeTitle: {
    fontSize: 9.5,
    marginBottom: 5,
    color: "#334155",
  },

  scopeText: {
    fontSize: 8.5,
    lineHeight: 1.35,
    color: "#334155",
  },

  notesText: {
    fontSize: 8.5,
    lineHeight: 1.3,
  },
  termsSection: {
  marginTop: 6,
  marginBottom: 10,
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: "#e2e8f0",
},

termsGrid: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 12,
},

termsCol: {
  width: "48%",
  borderWidth: 1,
  borderColor: "#cbd5e1",
  backgroundColor: "#f8fafc",
  padding: 8,
},

termsTitle: {
  fontSize: 9,
  marginBottom: 5,
  color: "#334155",
},

termsText: {
  fontSize: 8,
  lineHeight: 1.35,
  color: "#475569",
},
});

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function resolveLogoPath() {
  return path.join(process.cwd(), "public", "brand", "partsec-logo.png");
}

export function ProposalPDF({ proposal }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logoBlock}>
              <Image style={styles.logo} src={resolveLogoPath()} />
              <Text style={styles.title}>Proposta Comercial</Text>
              <Text style={styles.proposalCode}>
                {formatProposalNumber(
                  proposal.proposalNumber,
                  proposal.createdAt
                )}
              </Text>
            </View>

            <View style={styles.headerMeta}>
              <Text style={styles.metaLine}>{proposal.title}</Text>
              <Text style={styles.metaLine}>
                Data: {formatDate(proposal.createdAt)}
              </Text>
              <Text style={styles.metaLine}>
                Status: {formatProposalStatus(proposal.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.twoCols]}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Cliente</Text>

            <Text style={styles.label}>Razão social</Text>
            <Text style={styles.value}>{proposal.customer.companyName}</Text>

            <Text style={styles.label}>Contato</Text>
            <Text style={styles.value}>{proposal.customer.contactName}</Text>

            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>{proposal.customer.contactEmail}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Parceiro</Text>

            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{proposal.partner.name}</Text>

            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>{proposal.partner.email}</Text>
          </View>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>Sobre a solução</Text>

          <Text style={styles.descriptionText}>
            O Partsec One é a solução da Partsec para centralização de
            monitoramento, visibilidade operacional e consolidação de
            informações do ambiente de TI e segurança.
            {"\n\n"}
            A plataforma permite reunir ativos, eventos e indicadores em uma
            visão única, apoiando a operação com mais agilidade, padronização e
            proatividade.
          </Text>
        </View>

        <View style={styles.scopeBox}>
          <Text style={styles.scopeTitle}>Escopo desta proposta</Text>

          <Text style={styles.scopeText}>
            {proposal.scopeDescription?.trim()
              ? proposal.scopeDescription
              : "Escopo específico não informado."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuração da proposta</Text>

          <View style={styles.highlightGrid}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightLabel}>Plano</Text>
              <Text style={styles.highlightValue}>
                {formatProposalPlan(proposal.plan)}
              </Text>
            </View>

            <View style={styles.highlightCard}>
              <Text style={styles.highlightLabel}>Ativos</Text>
              <Text style={styles.highlightValue}>
                {proposal.activeCount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financeiro</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.cellLabel}>Descrição</Text>
              <Text style={styles.cellValue}>Valor</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.cellLabel}>Assinatura mensal</Text>
              <Text style={styles.cellValue}>
                {formatCurrency(proposal.subtotal)}
              </Text>
            </View>

            {Number(proposal.discountValue) > 0 ? (
              <View style={styles.tableRow}>
                <Text style={styles.cellLabel}>
                  Desconto mensal ({Number(proposal.discountPercent)}%)
                </Text>
                <Text style={styles.cellValue}>
                  - {formatCurrency(proposal.discountValue)}
                </Text>
              </View>
            ) : null}

            <View style={styles.tableRow}>
              <Text style={styles.cellLabel}>Setup inicial (único)</Text>
              <Text style={styles.cellValue}>
                {formatCurrency(proposal.setupFee)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total mensal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(proposal.total)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <View style={styles.noteBox}>
            <Text style={styles.notesText}>
              {proposal.notes || "Nenhuma observação registrada."}
            </Text>
          </View>
        </View>
	<View style={styles.termsSection}>
  <View style={styles.termsGrid}>
    <View style={styles.termsCol}>
      <Text style={styles.termsTitle}>Validade da proposta</Text>
      <Text style={styles.termsText}>
        Esta proposta é válida por 15 dias corridos a partir da data de emissão.
      </Text>
    </View>

    <View style={styles.termsCol}>
      <Text style={styles.termsTitle}>Condições comerciais</Text>
      <Text style={styles.termsText}>
        Os valores apresentados contemplam o escopo descrito nesta proposta.
        O setup inicial é cobrado em parcela única e a mensalidade refere-se à
        recorrência do serviço. Quaisquer alterações de escopo poderão implicar
        revisão comercial. O início da operação está condicionado ao aceite da
        proposta e ao alinhamento de implantação.
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
