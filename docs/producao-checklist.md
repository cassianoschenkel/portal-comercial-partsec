# Checklist Pos-Deploy

## Acesso
- Login ADMIN funciona.
- Login parceiro funciona.
- Usuario inativo nao acessa.
- Usuario excluido logicamente nao acessa.

## Fluxo comercial
- Criar cliente.
- Criar proposta.
- Abrir proposta.
- Baixar PDF da proposta.
- Aceitar proposta.

## Fluxo financeiro
- Sincronizar comissoes.
- Confirmar recebimento do cliente e liberar comissao.
- Validar que comissao prevista nao entra em lote ou relatorio.
- Gerar relatorio mensal.
- Enviar relatorio ao parceiro.
- Partner Admin abre relatorio.
- Partner Admin faz upload de NF e boleto.
- ADMIN baixa NF e boleto.
- ADMIN reenvia e-mail ao financeiro.
- Criar lote de pagamento.
- Marcar lote como pago.

## E-mail
- Convite de usuario chega.
- Relatorio mensal chega ao parceiro.
- Notificacao de documentos chega ao financeiro.
- Reenvio ao financeiro funciona.

## Storage
- `COMMISSION_DOCUMENTS_DIR` existe.
- Processo Node consegue escrever no diretorio.
- Processo Node consegue ler PDFs para download.
- Nginx nao serve o diretorio diretamente.
- Espaco em disco esta adequado.

## Backup e restore
- Backup PostgreSQL executa.
- Backup de documentos executa.
- Restore foi testado em ambiente separado.
- Backups possuem retencao definida.

## Observabilidade
- `GET /api/health` retorna `status: ok`.
- `pm2 status` sem restart loop.
- `pm2 logs partsec-portal-comercial` sem erros recorrentes.
- Logs do Nginx sem 4xx/5xx inesperados.
- Certificado HTTPS valido.

## Operacao
- Variaveis de ambiente revisadas.
- `npx prisma migrate deploy` aplicado.
- Build de producao validado.
- Checklist de rollback revisado.
