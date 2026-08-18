# Configuração local

O projeto não versiona ficheiros `.env` nem `.env.example`. Crie um ficheiro `.env` **somente na sua máquina** e defina as variáveis abaixo com valores emitidos pelo seu provedor:

```text
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/igreja_jornada
JWT_SECRET=uma-chave-longa-e-aleatoria
OAUTH_SERVER_URL=https://seu-servidor-oauth.example
VITE_APP_ID=identificador-publico
VITE_OAUTH_PORTAL_URL=https://seu-portal-oauth.example
BUILT_IN_FORGE_API_URL=https://seu-servico-de-integracoes.example
BUILT_IN_FORGE_API_KEY=credencial-exclusiva-do-servidor
```

Não enviar este ficheiro para controlo de versões. Depois de configurar as variáveis, execute:

```bash
pnpm install
pnpm drizzle-kit migrate
pnpm dev
```

Para um ambiente publicado, configure os mesmos valores no painel seguro do provedor de hospedagem.
