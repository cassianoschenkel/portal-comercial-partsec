import type { AssessmentStatus, AssessmentType } from "@prisma/client";

export type AssessmentQuestionType = "text" | "textarea" | "number" | "select";

export type AssessmentQuestion = {
  name: string;
  label: string;
  type: AssessmentQuestionType;
  required?: boolean;
  options?: { value: string; label: string }[];
};

export type AssessmentSection = {
  key: string;
  title: string;
  questions: AssessmentQuestion[];
};

const YES_NO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const YES_NO_UNKNOWN = [
  ...YES_NO,
  { value: "nao_sei", label: "Não sei" },
];

const PARTIAL_UNKNOWN = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "parcial", label: "Parcial" },
  { value: "nao_sei", label: "Não sei" },
];

const YES_NO_PARTIAL = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "parcial", label: "Parcial" },
];

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  {
    key: "responsavel",
    title: "Dados do responsável",
    questions: [
      { name: "responsavel.nome", label: "Nome", type: "text", required: true },
      { name: "responsavel.email", label: "E-mail", type: "text", required: true },
      { name: "responsavel.telefone", label: "Telefone", type: "text", required: true },
      { name: "responsavel.cargo", label: "Cargo/função", type: "text" },
      {
        name: "responsavel.observacoes",
        label: "Observações gerais",
        type: "textarea",
      },
    ],
  },
  {
    key: "rede",
    title: "Ativos de rede",
    questions: [
      {
        name: "rede.firewallsQuantidade",
        label: "Quantidade aproximada de firewalls",
        type: "number",
      },
      {
        name: "rede.firewallsModelos",
        label: "Fabricantes/modelos de firewalls",
        type: "textarea",
      },
      {
        name: "rede.firewallsHa",
        label: "Firewalls em HA?",
        type: "select",
        options: YES_NO_UNKNOWN,
      },
      {
        name: "rede.switchesQuantidade",
        label: "Quantidade aproximada de switches",
        type: "number",
      },
      {
        name: "rede.switchesGerenciaveis",
        label: "Switches gerenciáveis?",
        type: "select",
        options: PARTIAL_UNKNOWN,
      },
      {
        name: "rede.accessPointsQuantidade",
        label: "Quantidade aproximada de access points",
        type: "number",
      },
      {
        name: "rede.wifiFabricanteControlador",
        label: "Fabricante/controlador Wi-Fi",
        type: "text",
      },
      {
        name: "rede.impressorasQuantidade",
        label: "Quantidade aproximada de impressoras",
        type: "number",
      },
      {
        name: "rede.snmpHabilitado",
        label: "Há SNMP habilitado nos ativos?",
        type: "select",
        options: PARTIAL_UNKNOWN,
      },
      {
        name: "rede.vlansSegmentacao",
        label: "Existem VLANs/segmentação?",
        type: "select",
        options: PARTIAL_UNKNOWN,
      },
      {
        name: "rede.observacoes",
        label: "Observações sobre rede",
        type: "textarea",
      },
    ],
  },
  {
    key: "servidores",
    title: "Servidores e aplicações",
    questions: [
      {
        name: "servidores.fisicosQuantidade",
        label: "Quantidade aproximada de servidores físicos",
        type: "number",
      },
      {
        name: "servidores.vmsQuantidade",
        label: "Quantidade aproximada de máquinas virtuais",
        type: "number",
      },
      {
        name: "servidores.hypervisor",
        label: "Hypervisor utilizado",
        type: "text",
      },
      {
        name: "servidores.windowsQuantidade",
        label: "Quantidade de servidores Windows",
        type: "number",
      },
      {
        name: "servidores.linuxQuantidade",
        label: "Quantidade de servidores Linux",
        type: "number",
      },
      {
        name: "servidores.activeDirectory",
        label: "Usa Active Directory?",
        type: "select",
        options: YES_NO,
      },
      {
        name: "servidores.bancos",
        label: "Usa SQL Server ou outros bancos? Descrever",
        type: "textarea",
      },
      {
        name: "servidores.exchangeLocal",
        label: "Usa Exchange local?",
        type: "select",
        options: YES_NO,
      },
      {
        name: "servidores.aplicacoesCriticas",
        label: "Principais aplicações críticas",
        type: "textarea",
      },
      {
        name: "servidores.backupAtual",
        label: "Existe backup atualmente?",
        type: "select",
        options: YES_NO_PARTIAL,
      },
      {
        name: "servidores.solucaoBackup",
        label: "Solução de backup atual",
        type: "text",
      },
      {
        name: "servidores.observacoes",
        label: "Observações sobre servidores/aplicações",
        type: "textarea",
      },
    ],
  },
  {
    key: "nuvem",
    title: "Nuvem, usuários e SaaS",
    questions: [
      {
        name: "nuvem.microsoft365",
        label: "Usa Microsoft 365?",
        type: "select",
        options: YES_NO,
      },
      {
        name: "nuvem.microsoft365Usuarios",
        label: "Quantidade aproximada de usuários Microsoft 365",
        type: "number",
      },
      { name: "nuvem.azure", label: "Usa Azure?", type: "select", options: YES_NO },
      {
        name: "nuvem.azureRecursos",
        label: "Recursos relevantes no Azure",
        type: "textarea",
      },
      {
        name: "nuvem.googleWorkspace",
        label: "Usa Google Workspace?",
        type: "select",
        options: YES_NO,
      },
      {
        name: "nuvem.sophosCentral",
        label: "Usa Sophos Central?",
        type: "select",
        options: YES_NO,
      },
      {
        name: "nuvem.endpointsQuantidade",
        label: "Quantidade aproximada de endpoints",
        type: "number",
      },
      {
        name: "nuvem.ferramentasSeguranca",
        label: "Ferramentas de segurança em uso",
        type: "textarea",
      },
      {
        name: "nuvem.observacoes",
        label: "Observações sobre nuvem/SaaS",
        type: "textarea",
      },
    ],
  },
  {
    key: "prioridades",
    title: "Prioridades e riscos",
    questions: [
      {
        name: "prioridades.doresAtuais",
        label: "Principais dores atuais",
        type: "textarea",
      },
      {
        name: "prioridades.monitorarPrimeiro",
        label: "O que precisa ser monitorado/protegido primeiro",
        type: "textarea",
      },
      {
        name: "prioridades.sistemasCriticos",
        label: "Sistemas mais críticos",
        type: "textarea",
      },
      {
        name: "prioridades.incidentesRecentes",
        label: "Incidentes recentes",
        type: "textarea",
      },
      {
        name: "prioridades.expectativas",
        label: "Expectativas com PoC/implantação",
        type: "textarea",
      },
      {
        name: "prioridades.restricoes",
        label: "Restrições técnicas ou comerciais",
        type: "textarea",
      },
      {
        name: "prioridades.outrasObservacoes",
        label: "Outras observações",
        type: "textarea",
      },
    ],
  },
];

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  POC: "PoC",
  IMPLEMENTATION: "Implantação",
  COMMERCIAL_SCOPING: "Escopo comercial",
  RENEWAL: "Renovação",
  OTHER: "Outro",
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  IN_PROGRESS: "Em andamento",
  SUBMITTED: "Respondido",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

export function getAssessmentStatusBadgeClasses(status: AssessmentStatus) {
  const classes: Record<AssessmentStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    SENT: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    SUBMITTED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    EXPIRED: "bg-zinc-100 text-zinc-600",
  };

  return classes[status];
}
