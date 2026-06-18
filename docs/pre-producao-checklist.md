# Checklist de Pre-Producao

## 1. Variaveis de ambiente obrigatorias
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `APP_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_FROM_NAME`
- `FINANCE_EMAIL`
- `COMMISSION_DOCUMENTS_DIR`

## 2. Banco PostgreSQL
- Confirmar host, porta, database, usuario e senha.
- Confirmar acesso da aplicacao ao banco.
- Confirmar timezone e politica de backup.

## 3. Migrations Prisma
- Rodar `npx prisma migrate deploy` no ambiente de producao.
- Rodar `npx prisma generate` durante o build/deploy.
- Validar que todas as migrations foram aplicadas.

## 4. Usuario ADMIN inicial
- Criar ou validar usuario ADMIN.
- Validar senha forte.
- Validar que o ADMIN acessa `/dashboard/financeiro`.

## 5. SMTP Zoho
- Validar host, porta, usuario, senha e remetente.
- Enviar convite de teste.
- Enviar relatorio mensal de teste.
- Reenviar e-mail ao financeiro com documentos de teste.

## 6. FINANCE_EMAIL
- Confirmar destinatario final.
- Validar recebimento na caixa configurada.

## 7. Diretorio/volume de documentos
- Definir `COMMISSION_DOCUMENTS_DIR`.
- Usar diretorio fora de `/public`.
- Montar volume persistente em producao.
- Garantir permissoes de leitura/escrita para o processo da aplicacao.

## 8. Backup do banco
- Configurar backup automatico.
- Testar restauracao em ambiente isolado.
- Documentar janela e retencao.

## 9. Backup dos documentos
- Configurar backup do volume de documentos.
- Testar restauracao de NF/boleto.
- Garantir que backup de documentos e banco estejam sincronizados.

## 10. Permissoes de filesystem
- Aplicacao deve conseguir criar diretorios em `COMMISSION_DOCUMENTS_DIR`.
- Aplicacao deve conseguir ler arquivos para download e e-mail.
- Aplicacao nao deve expor o diretorio de documentos como asset publico.

## 11. Testes de login
- ADMIN ativo consegue logar.
- Partner Admin ativo consegue logar.
- Partner Seller ativo consegue logar.
- Partner Viewer ativo consegue logar.
- Usuario inativo nao consegue logar.
- Usuario excluido logicamente nao consegue logar.

## 12. Testes de RBAC
- ADMIN acessa areas administrativas globais.
- Parceiros nao acessam `/dashboard/financeiro`.
- PARTNER/PARTNER_ADMIN veem apenas dados do proprio parceiro.
- PARTNER_ADMIN gerencia equipe propria.
- PARTNER_SELLER nao gerencia equipe.
- PARTNER_VIEWER nao cria, edita ou desativa dados.

## 13. Testes de upload/download
- Partner Admin envia NF e boleto em PDF.
- Arquivo vazio e bloqueado.
- Arquivo nao PDF e bloqueado.
- Arquivo maior que 10 MB e bloqueado.
- ADMIN baixa documentos.
- Parceiro baixa apenas documentos do proprio parceiro.
- Parceiro de outro partnerId nao baixa documento alheio.

## 14. Testes de envio de e-mail
- Convite de usuario.
- Relatorio mensal ao parceiro.
- Envio inicial de documentos ao financeiro.
- Reenvio de documentos ao financeiro.
- Falha SMTP nao perde arquivos enviados.

## 15. Testes de fluxo de comissao ponta a ponta
- Proposta aceita gera comissao prevista.
- ADMIN confirma recebimento do cliente e libera comissao.
- Comissao prevista nao entra em lote/relatorio.
- Comissao liberada entra em relatorio mensal.
- Parceiro envia documentos.
- ADMIN recebe/baixa documentos.
- ADMIN cria lote apenas com comissoes liberadas.
- ADMIN paga lote.

## 16. Checklist de deploy
- Atualizar variaveis de ambiente.
- Rodar migrations.
- Rodar build.
- Validar login ADMIN.
- Validar SMTP.
- Validar storage de documentos.
- Validar rotas financeiras ADMIN.
- Validar area de parceiro.

## 17. Checklist de rollback
- Registrar versao anterior do deploy.
- Garantir backup do banco antes da migration.
- Garantir backup do volume de documentos.
- Ter plano para restaurar banco e volume juntos.
- Validar login e rotas criticas apos rollback.

## 18. Observacao futura
- Avaliar Object Storage, como S3, OCI Object Storage ou equivalente, para armazenar documentos em producao com versionamento, criptografia, lifecycle policy e backup independente.
