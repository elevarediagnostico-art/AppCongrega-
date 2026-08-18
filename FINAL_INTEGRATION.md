# CONGREGA — Integração final

Esta pasta contém a versão consolidada do aplicativo CONGREGA, reunindo a aplicação autenticada, a landing page pública, a reorganização da navegação, a área administrativa e o Devocional Diário anual.

## Conteúdo integrado

| Área | Localização | Estado |
|---|---|---|
| Landing page pública | `client/public/landing.html` | Integrada e acessível em `/landing.html` após o deploy. |
| Navegação do membro | `client/src/components/MemberNav.tsx` | Consolidada em Início, Agenda, Palavra, Igreja e Perfil. |
| Hub Igreja e Perfil | `client/src/pages/CommunityHub.tsx`, `client/src/pages/Profile.tsx` | Agregadores sem duplicar APIs ou rotas existentes. |
| Administração | `client/src/pages/Admin.tsx`, `client/src/components/DashboardLayout.tsx` | Grupos funcionais, pendências e atalhos. |
| Devocional Diário | `client/src/pages/Devotional.tsx`, `server/devotionalCatalog.ts` | Catálogo anual por data, com 365 entradas. |
| Dados editoriais | `content/annual-calendar.json`, `content/annual-devotionals.json` | Calendário de janeiro a dezembro. |
| Backend | `server/routers.ts` | Conteúdo publicado pela igreja tem prioridade; o catálogo é fallback. |
| Base de dados | `drizzle/schema.ts`, `drizzle/0008_lethal_morgan_stark.sql` | Inclui compromissos pessoais privados. |

## Precedência do devocional

Quando existe um devocional publicado pela igreja para a data solicitada, esse conteúdo é apresentado. Quando não existe, o backend usa o catálogo editorial anual local. Assim, a igreja pode substituir qualquer entrada do catálogo através do fluxo de publicação existente, sem alterar o frontend.

## Validação executada

A versão foi validada com os comandos seguintes:

```bash
pnpm check
pnpm test
pnpm build
```

A verificação TypeScript terminou sem erros. Os testes existentes passaram: 2 ficheiros de teste e 5 testes no total. O build de produção terminou sem erros. Os avisos restantes referem-se às variáveis opcionais de analytics e ao tamanho de chunks do frontend.

## Arranque local

Instale as dependências com `pnpm install`, configure as variáveis de ambiente conforme `ENVIRONMENT.md` e `LOCAL_SETUP.md`, e execute `pnpm dev`. Para aplicar a migração de compromissos pessoais num ambiente com base de dados, use o procedimento de migração definido no `DATABASE.md`.

## Nota editorial

O catálogo anual foi criado para substituir a reprodução do Pão Diário existente por conteúdo próprio. Antes de uma publicação comercial, faça uma revisão pastoral, editorial e de licenciamento da tradução bíblica utilizada pela igreja.
