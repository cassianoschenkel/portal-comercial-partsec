import path from "node:path";
import React from "react";

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { GeneralProposalPdfData } from "@/lib/general-proposals/pdf-data";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingHorizontal: 36,
    paddingBottom: 58,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  cover: {
    paddingTop: 48,
    paddingHorizontal: 44,
    paddingBottom: 58,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#0f172a",
  },
  logo: {
    width: 210,
    height: 60,
    objectFit: "contain",
  },
  coverBody: {
    marginTop: 62,
    borderLeftWidth: 5,
    borderLeftColor: "#2563eb",
    paddingLeft: 24,
  },
  eyebrow: {
    fontSize: 9,
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 28,
    lineHeight: 1.15,
    marginBottom: 18,
  },
  coverClient: {
    fontSize: 17,
    color: "#334155",
    marginBottom: 6,
  },
  coverVendor: {
    fontSize: 12,
    color: "#64748b",
  },
  coverMeta: {
    marginTop: 54,
    flexDirection: "row",
    gap: 12,
  },
  metaCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  metaLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10,
    color: "#0f172a",
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  pageLogo: {
    width: 120,
    height: 34,
    objectFit: "contain",
  },
  proposalCode: {
    fontSize: 9,
    color: "#475569",
  },
  section: {
    marginBottom: 14,
  },
  sectionCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 9,
    padding: 13,
    backgroundColor: "#ffffff",
  },
  sectionSoft: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 9,
    padding: 13,
    backgroundColor: "#f8fafc",
  },
  sectionTitle: {
    fontSize: 10,
    color: "#1d4ed8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 7,
  },
  bodyText: {
    fontSize: 9.2,
    lineHeight: 1.45,
    color: "#334155",
  },
  table: {
  width: "100%",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 8,
  overflow: "hidden",
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
tableHeaderCell: {
  paddingVertical: 10,
  paddingHorizontal: 10,
  fontSize: 8,
  color: "#FFFFFF",
  fontWeight: 700,
},
tableCell: {
  paddingVertical: 10,
  paddingHorizontal: 10,
  fontSize: 8,
  color: "#0f172a",
  lineHeight: 1.35,
  fontWeight: 400,
},
skuCell: {
  paddingRight: 16,
},
quantityCell: {
  textAlign: "center",
  paddingLeft: 8,
  paddingRight: 8,
},
termCell: {
  textAlign: "center",
  paddingLeft: 8,
  paddingRight: 8,
},
valueCell: {
  textAlign: "right",
  paddingLeft: 8,
},
alignRight: {
  textAlign: "right",
},
  investment: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 9,
    overflow: "hidden",
  },
  investmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  investmentTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
  },
  investmentLabel: {
    color: "#475569",
  },
  investmentValue: {
    color: "#0f172a",
  },
  investmentTotalText: {
    fontSize: 11,
    color: "#ffffff",
  },
  twoColumns: {
    flexDirection: "row",
    gap: 14,
  },
  column: {
    width: "50%",
  },
  bullet: {
    fontSize: 8.8,
    lineHeight: 1.35,
    color: "#334155",
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 16,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#64748b",
  },
});

const serviceTypeLabels: Record<string, string> = {
  IMPLEMENTATION: "Implementação",
  MIGRATION: "Migração",
  CONFIGURATION: "Configuração",
  TRAINING: "Treinamento",
  CONSULTING: "Consultoria",
  HEALTH_CHECK: "Health check",
  SUPPORT_HOURS: "Horas de suporte",
  PROJECT_MANAGEMENT: "Gestão de projeto",
  OTHER: "Outro",
};

const standardConditions = [
  "Valores válidos até a data de validade informada nesta proposta.",
  "Licenciamento conforme prazo contratado.",
  "Serviços executados conforme escopo descrito.",
  "Itens não descritos expressamente nesta proposta não estão incluídos.",
  "Prazos de entrega e implantação dependem de disponibilidade técnica e agenda acordada entre as partes.",
  "Valores sujeitos a alteração após vencimento da proposta.",
];

const nextSteps = [
  "Aprovação comercial da proposta.",
  "Emissão de pedido ou aceite formal.",
  "Faturamento conforme condição comercial acordada.",
  "Agendamento técnico, quando houver serviços.",
  "Execução, validação e encerramento do projeto.",
];

const aboutPartsec =
  "A Partsec Consultoria e Serviços atua de forma consultiva na entrega de soluções de segurança da informação, infraestrutura, continuidade operacional e serviços gerenciados. Combinamos análise técnica, implantação, sustentação e acompanhamento próximo para oferecer segurança, visibilidade e previsibilidade a ambientes corporativos.";

function logoPath() {
  return path.join(process.cwd(), "public", "brand", "partsec-logo.png");
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(value);
}

function formatCurrency(value: string, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}

function Footer({ proposalNumber }: { proposalNumber: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Partsec Consultoria e Serviços</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) =>
          `${proposalNumber} · ${pageNumber}/${totalPages}`
        }
      />
    </View>
  );
}

function formatSkuForPdf(sku?: string | null) {
  if (!sku) return "—";
  return sku.replace(/([\-_/\.])/g, "$1\u200B");
}

export function GeneralProposalPDF({ data }: { data: GeneralProposalPdfData }) {
  const productColumns = ["24%", "27%", "17%", "8%", "10%", "14%"];
  const serviceColumns = ["25%", "34%", "15%", "10%", "16%"];

  return (
    <Document title={`${data.proposalNumber} - ${data.title}`} author="Partsec Consultoria e Serviços">
      <Page size="A4" style={styles.cover}>
        <View style={styles.topBar} fixed />
        <Image style={styles.logo} src={logoPath()} />
        <View style={styles.coverBody}>
          <Text style={styles.eyebrow}>Proposta comercial</Text>
          <Text style={styles.coverTitle}>{data.title}</Text>
          <Text style={styles.coverClient}>{data.customer.companyName}</Text>
          <Text style={styles.coverVendor}>Solução principal: {data.vendor.name}</Text>
        </View>
        <View style={styles.coverMeta}>
          <View style={styles.metaCard}><Text style={styles.metaLabel}>Proposta</Text><Text style={styles.metaValue}>{data.proposalNumber}</Text></View>
          <View style={styles.metaCard}><Text style={styles.metaLabel}>Data</Text><Text style={styles.metaValue}>{formatDate(data.createdAt)}</Text></View>
          <View style={styles.metaCard}><Text style={styles.metaLabel}>Validade</Text><Text style={styles.metaValue}>{data.validUntil ? formatDate(data.validUntil) : "A definir"}</Text></View>
        </View>
        <Footer proposalNumber={data.proposalNumber} />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <View style={styles.topBar} fixed />
        <View style={styles.pageHeader} fixed>
          <Image style={styles.pageLogo} src={logoPath()} />
          <Text style={styles.proposalCode}>{data.proposalNumber}</Text>
        </View>

        <View style={styles.sectionSoft}>
          <Text style={styles.sectionTitle}>Resumo executivo</Text>
          <Text style={styles.bodyText}>{data.executiveSummary}</Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contexto e objetivo</Text>
          <Text style={styles.bodyText}>{data.contextText}</Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Escopo da solução</Text>
          <Text style={styles.bodyText}>{data.projectScope}</Text>
        </View>
	{data.products.length > 0 ? (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Produtos e licenças ofertados</Text>

    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {["Produto", "Descrição", "SKU", "Qtd.", "Prazo", "Valor"].map((label, index) => (
          <Text
            key={label}
			style={[
			  styles.tableHeaderCell,
			  { width: productColumns[index] },
			  ...(index === 3 ? [styles.quantityCell] : []),
			  ...(index === 4 ? [styles.termCell] : []),
			  ...(index === 5 ? [styles.valueCell] : []),
			]}
          >
            {label}
          </Text>
        ))}
      </View>

      {data.products.map((product) => (
        <View key={product.id} style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: productColumns[0] }]}>
            {product.productName}
          </Text>

          <Text style={[styles.tableCell, { width: productColumns[1] }]}>
            {product.description || "—"}
          </Text>

          <Text style={[styles.tableCell, styles.skuCell, { width: productColumns[2] }]}>
            {formatSkuForPdf(product.sku)}
          </Text>

          <Text style={[styles.tableCell, styles.quantityCell, { width: productColumns[3] }]}>
            {Number(product.quantity).toLocaleString("pt-BR")}
          </Text>

          <Text style={[styles.tableCell, styles.termCell, { width: productColumns[4] }]}>
            {product.licenseTermMonths ? `${product.licenseTermMonths} meses` : "—"}
          </Text>

          <Text style={[styles.tableCell, styles.valueCell, { width: productColumns[5] }]}>
            {formatCurrency(product.finalItemPrice, data.currency)}
          </Text>
        </View>
	      ))}
	    </View>
	  </View>
	) : null}

        {data.services.length > 0 ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Serviços ofertados</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                {["Serviço", "Descrição", "Tipo", "Horas", "Valor"].map((label, index) => (
                  <Text key={label} style={[styles.tableHeaderCell, { width: serviceColumns[index] }, ...(index === 4 ? [styles.alignRight] : [])]}>{label}</Text>
                ))}
              </View>
              {data.services.map((service) => (
                <View key={service.id} style={styles.tableRow} wrap={false}>
                  <Text style={[styles.tableCell, { width: serviceColumns[0] }]}>{service.serviceName}</Text>
                  <Text style={[styles.tableCell, { width: serviceColumns[1] }]}>{service.description || "—"}</Text>
                  <Text style={[styles.tableCell, { width: serviceColumns[2] }]}>{serviceTypeLabels[service.serviceType] || service.serviceType}</Text>
                  <Text style={[styles.tableCell, { width: serviceColumns[3] }]}>{service.pricingMode === "HOURLY" && Number(service.estimatedHours) > 0 ? Number(service.estimatedHours).toLocaleString("pt-BR") : "—"}</Text>
                  <Text style={[styles.tableCell, styles.alignRight, { width: serviceColumns[4] }]}>{formatCurrency(service.totalSalePrice, data.currency)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.investment} wrap={false}>
          <View style={styles.tableHeader}><Text style={[styles.tableHeaderCell, { width: "100%" }]}>Investimento</Text></View>
          {data.products.length > 0 ? <View style={styles.investmentRow}><Text style={styles.investmentLabel}>Subtotal de produtos</Text><Text style={styles.investmentValue}>{formatCurrency(data.investment.subtotalProducts, data.currency)}</Text></View> : null}
          {data.services.length > 0 ? <View style={styles.investmentRow}><Text style={styles.investmentLabel}>Subtotal de serviços</Text><Text style={styles.investmentValue}>{formatCurrency(data.investment.subtotalServices, data.currency)}</Text></View> : null}
          {Number(data.investment.totalDiscount) > 0 ? <View style={styles.investmentRow}><Text style={styles.investmentLabel}>Desconto comercial</Text><Text style={styles.investmentValue}>- {formatCurrency(data.investment.totalDiscount, data.currency)}</Text></View> : null}
          <View style={styles.investmentTotal}><Text style={styles.investmentTotalText}>Valor total da proposta</Text><Text style={styles.investmentTotalText}>{formatCurrency(data.investment.finalPrice, data.currency)}</Text></View>
          <View style={styles.investmentRow}><Text style={styles.investmentLabel}>Condições de pagamento</Text><Text style={[styles.investmentValue, { maxWidth: "58%", textAlign: "right" }]}>{data.paymentTerms?.trim() || "A definir em conjunto com o cliente."}</Text></View>
          <View style={styles.investmentRow}><Text style={styles.investmentLabel}>Validade</Text><Text style={styles.investmentValue}>{data.validUntil ? formatDate(data.validUntil) : "A definir"}</Text></View>
        </View>

        <View style={styles.sectionCard} wrap={false}>
          <Text style={styles.sectionTitle}>Sobre a {data.vendor.name}</Text>
          <Text style={styles.bodyText}>{data.vendor.aboutText}</Text>
        </View>
        <View style={styles.sectionCard} wrap={false}>
          <Text style={styles.sectionTitle}>Sobre a Partsec</Text>
          <Text style={styles.bodyText}>{aboutPartsec}</Text>
        </View>

        <View style={styles.sectionCard} wrap={false}>
          <Text style={styles.sectionTitle}>Condições comerciais</Text>
          {data.commercialNotes?.trim() ? <Text style={[styles.bodyText, { marginBottom: 8 }]}>{data.commercialNotes}</Text> : null}
          {standardConditions.map((condition) => <Text key={condition} style={styles.bullet}>• {condition}</Text>)}
        </View>
		<View style={styles.sectionSoft} wrap={false}>
		  <Text style={styles.sectionTitle}>Próximos passos</Text>
		  {nextSteps.map((step) => (
			<Text key={step} style={styles.bullet}>
			  • {step}
			</Text>
		  ))}
		</View>

        <Footer proposalNumber={data.proposalNumber} />
      </Page>
    </Document>
  );
}
