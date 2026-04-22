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
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
} from "@/lib/utils/proposals";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingHorizontal: 32,
    paddingBottom: 30,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  topBar: {
    height: 16,
    backgroundColor: "#0f172a",
    marginBottom: 20,
    marginHorizontal: -32,
  },

  header: {
    marginBottom: 16,
    paddingBottom: 14,
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
    width: 260,
    height: 78,
    objectFit: "contain",
    marginBottom: 10,
  },

  headerMeta: {
    width: "42%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 12,
    alignSelf: "flex-start",
  },

  title: {
    fontSize: 24,
    marginBottom: 4,
    color: "#0f172a",
  },

  proposalCode: {
    fontSize: 18,
    color: "#1d4ed8",
  },

  metaTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: "#0f172a",
  },

  metaLine: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 4,
  },

  section: {
    marginBottom: 14,
  },

  sectionCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#ffffff",
  },

  sectionSoftCard: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#f8fafc",
  },

  sectionTitle: {
    fontSize: 10,
    marginBottom: 10,
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
    marginBottom: 8,
  },

  label: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 2,
    textTransform: "uppercase",
  },

  value: {
    fontSize: 10,
    color: "#0f172a",
  },

  valueStrong: {
    fontSize: 12,
    color: "#0f172a",
  },

  bodyText: {
    fontSize: 10,
    lineHeight: 1.45,
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
    fontSize: 22,
    color: "#1d4ed8",
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
    bottom: 12,
    paddingTop: 8,
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

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function resolveLogoPath() {
  return path.join(process.cwd(), "public", "brand", "partsec-logo.png");
}

export function ProposalPDF({ proposal }: any) {
  const notesText =
    proposal.notes?.trim() ||
    `Para a habilitação do serviço (enabling), será necessário o alinhamento com a equipe técnica do cliente para o fornecimento dos acessos de coleta de informações (API, syslog, SNMP, etc).

O prazo para a finalização da implementação é de até 30 dias corridos a partir do aceite formal da proposta.`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

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
                Data: {formatDate(proposal.createdAt)}
              </Text>
              <Text style={styles.metaLine}>
                Status: {formatProposalStatus(proposal.status)}
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
            <Text style={styles.sectionTitle}>Parceiro</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.valueStrong}>{proposal.partner.name}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <Text style={styles.value}>{proposal.partner.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionSoftCard}>
          <Text style={styles.sectionTitle}>Sobre a solução</Text>
          <Text style={styles.bodyText}>
            O Partsec One é a solução da Partsec para centralização de
            monitoramento, visibilidade operacional e consolidação de
            informações do ambiente de TI e segurança.
            {"\n\n"}
            A plataforma permite reunir ativos, eventos e indicadores em uma
            visão única, apoiando a operação com mais agilidade, padronização e
            proatividade.
          </Text>
        </View>

        <View style={[styles.section, { marginTop: 14 }]}>
          <View style={styles.sectionSoftCard}>
            <Text style={styles.sectionTitle}>Escopo desta proposta</Text>
            <Text style={styles.bodyText}>
              {proposal.scopeDescription?.trim()
                ? proposal.scopeDescription
                : "Escopo específico não informado."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.twoCols}>
            <View style={[styles.col, { width: "38%" }]}>
              <Text style={styles.sectionTitle}>Configuração da proposta</Text>

              <View style={styles.configGrid}>
                <View style={styles.configCard}>
                  <Text style={styles.configLabel}>Plano</Text>
                  <Text style={styles.configValue}>
                    {formatProposalPlan(proposal.plan)}
                  </Text>
                </View>
              </View>

              <View style={[styles.configGrid, { marginTop: 10 }]}>
                <View style={styles.configCard}>
                  <Text style={styles.configLabel}>Ativos</Text>
                  <Text style={styles.configValue}>
                    {proposal.activeCount}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.col, { width: "58%" }]}>
              <Text style={styles.sectionTitle}>Financeiro</Text>

              <View style={styles.financialBox}>
                <View style={styles.financialHeader}>
                  <Text style={styles.financialHeaderLabel}>Descrição</Text>
                  <Text style={styles.financialHeaderValue}>Valor</Text>
                </View>

                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Assinatura mensal</Text>
                  <Text style={styles.financialValue}>
                    {formatCurrency(proposal.subtotal)}
                  </Text>
                </View>

                {Number(proposal.discountValue) > 0 ? (
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>
                      Desconto mensal ({Number(proposal.discountPercent)}%)
                    </Text>
                    <Text style={styles.financialValue}>
                      - {formatCurrency(proposal.discountValue)}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Setup inicial (único)</Text>
                  <Text style={styles.financialValue}>
                    {formatCurrency(proposal.setupFee)}
                  </Text>
                </View>

                <View style={styles.financialTotalRow}>
                  <Text style={styles.financialTotalLabel}>Total mensal</Text>
                  <Text style={styles.financialTotalValue}>
                    {formatCurrency(proposal.total)}
                  </Text>
                </View>
              </View>
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
	<View style={styles.topBar} />

		<View style={styles.sectionSoftCard} wrap={false}>
		<Text style={styles.sectionTitle}>Observações</Text>
		<Text style={styles.notesText}>{notesText}</Text>
	</View>

	<View style={[styles.section, { marginTop: 14 }]}>
		<View style={styles.termsGrid}>
		<View style={styles.termsCol}>
        <Text style={styles.termsTitle}>Validade da proposta</Text>
        <Text style={styles.termsText}>
          Esta proposta é válida por 15 dias corridos a partir da data de
          emissão.
        </Text>
    </View>

		<View style={styles.termsCol}>
        <Text style={styles.termsTitle}>Condições comerciais</Text>
        <Text style={styles.termsText}>
          Os valores apresentados contemplam o escopo descrito nesta proposta.
          O setup inicial é cobrado em parcela única e a mensalidade refere-se
          à recorrência do serviço. Quaisquer alterações de escopo poderão
          implicar revisão comercial. O início da operação está condicionado ao
          aceite da proposta e ao alinhamento de implantação.
        </Text>
      </View>
    </View>
  </View>

  <View style={[styles.section, { marginTop: 10 }]}>
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

  <View style={styles.footer} fixed>
    <Text style={styles.footerLine}>www.partsec.com.br</Text>
    <Text style={styles.footerLine}>comercial@partsec.com.br</Text>
    <Text style={styles.footerLine}>+55 51 99329-6675</Text>
  </View>
</Page>

<Page size="A4" style={styles.page}>
  <View style={styles.topBar} />

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

  <View style={styles.footer} fixed>
    <Text style={styles.footerLine}>www.partsec.com.br</Text>
    <Text style={styles.footerLine}>comercial@partsec.com.br</Text>
    <Text style={styles.footerLine}>+55 51 99329-6675</Text>
  </View>
</Page>

    </Document>
  );
}