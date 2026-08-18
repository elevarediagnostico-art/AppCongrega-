# Arquitetura

## Visão geral

A aplicação é um **monólito modular** com React no cliente, Express no servidor, procedimentos tRPC como contrato de API e Drizzle ORM sobre MySQL/TiDB. A escolha reduz complexidade operacional e mantém os tipos consistentes entre interface e backend.

```text
Cliente React → tRPC protegido → Serviços/consultas → MySQL/TiDB
                         ↘ S3 para fotografias e materiais
```

## Isolamento por igreja

A infraestrutura é partilhada, mas cada igreja usa uma experiência e um conjunto de dados independentes. As entidades de negócio possuem `churchId` direta ou indiretamente. Antes de qualquer operação, o backend executa uma verificação de pertença ativa e de papel no contexto da igreja.

> Nunca confiar num `churchId` enviado pela interface sem confirmar a membership do utilizador no servidor.

As fotografias são guardadas sob a chave lógica `churches/{churchId}/...`, evitando colisões e facilitando auditoria de armazenamento.

## Autorização

A matriz de capacidades está em `server/rbac.ts`. Os procedimentos de leitura e escrita usam `protectedProcedure` e `requireChurchCapability`. A interface pode ocultar ações indisponíveis para melhorar a experiência, mas a decisão de segurança está sempre no backend.

| Capacidade | Membro | Pastor | Administrador |
| --- | ---: | ---: | ---: |
| Experiência diária | Sim | Sim | Sim |
| Métricas | Não | Sim | Sim |
| Atenção pastoral | Não | Sim | Não |
| Conteúdo, EBD, agenda e galeria | Não | Não | Sim |
| Relatório mensal | Não | Sim | Sim |

## Imagens da galeria

O browser otimiza imagens antes do envio: aceita ficheiros de imagem até 10 MB, limita a versão principal a 2048 px, converte para **WebP** e cria miniaturas WebP até 480 px. O servidor só aceita `image/webp`, limita o tamanho otimizado, recebe metadados e envia os bytes para armazenamento de objetos. A base de dados mantém apenas URLs, chaves e metadados.

## Materiais existentes no Google Drive

O Google Drive é opcional e limitado a uma biblioteca documental já existente da igreja. Uma lição de Revista EBD pode guardar uma `materialUrl` autorizada e abrir esse recurso sob demanda; o aplicativo não sincroniza, migra nem usa Drive para presença, membros, Bíblia, oração ou métricas. Esta abordagem evita uma migração de ficheiros prematura e mantém os dados operacionais transacionais na base relacional.

## Tarefas programadas

Não existem temporizadores em processo. Notificações recorrentes, publicação agendada ou recalculação periódica devem usar um mecanismo externo de agendamento com callbacks idempotentes no backend. A entrega inicial contém os dados necessários para preferências e registo de notificações, sem ativar cron por padrão.
