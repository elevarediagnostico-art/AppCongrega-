# Deploy

## Pré-requisitos

O destino precisa de Node.js 22, pnpm, acesso à base MySQL/TiDB e armazenamento de objetos compatível com as integrações configuradas. O processo não depende de processos persistentes ou temporizadores em memória.

## Passos

```bash
pnpm install --frozen-lockfile
pnpm drizzle-kit migrate
pnpm build
pnpm start
```

Configure as variáveis descritas em `ENVIRONMENT.md` antes de iniciar. Execute a migração uma única vez por versão, num processo controlado de release.

## Importação no Emergent

1. Importe o repositório ou carregue o código-fonte completo.
2. Configure o serviço Node com os comandos de build e start acima.
3. Crie a base de dados MySQL/TiDB e defina `DATABASE_URL`.
4. Configure autenticação e armazenamento de objetos com credenciais próprias.
5. Aplique migrações e valide login, tenancy, imagem WebP e relatórios CSV.

Não utilizar dados de demonstração para métricas de produção. Os primeiros indicadores devem ser derivados dos dados reais da igreja.
