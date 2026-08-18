# Runbook operacional

## Verificações após cada release

1. Executar `pnpm check` e `pnpm test`.
2. Confirmar que as migrações foram aplicadas.
3. Testar uma sessão de Membro, Pastor e Administrador.
4. Verificar que um utilizador não acede ao `churchId` de outra igreja.
5. Subir uma fotografia e confirmar WebP, miniatura, galeria, download e partilha.
6. Gerar e exportar um relatório mensal CSV.

## Incidente de privacidade

Se surgir acesso indevido, desative a conta ou membership afetada, recolha o identificador de utilizador, `churchId`, procedimento e horário. Preserve logs de auditoria e não altere pedidos de oração ou sinais pastorais sem autorização humana.

## Galeria e custo

Monitorize `originalBytes`, `optimizedBytes`, resolução e volume por igreja. Se a entrega de imagens crescer, reduzir o limite da imagem principal ou a qualidade WebP antes de alterar a experiência do membro. Não guardar bytes de imagem na base de dados.

## Materiais Google Drive

Antes de publicar um link de Google Drive, confirme que o documento é autorizado e que as permissões de partilha estão adequadas ao público pretendido. O sistema abre materiais externos sob demanda e não deve guardar conteúdo confidencial ou dados operacionais no Drive.

## Relatórios para igrejas sede

O Administrador ou Pastor gera o relatório mensal padronizado e envia-o externamente à sede. A plataforma não fornece consolidação automática entre igrejas nem acesso de sede aos dados de igrejas locais.
