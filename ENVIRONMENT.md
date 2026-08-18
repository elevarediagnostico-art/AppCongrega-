# Variáveis de ambiente

Use `LOCAL_SETUP.md` para criar o seu ficheiro `.env` local sem incluir credenciais no repositório.

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sim | Ligação MySQL/TiDB. |
| `JWT_SECRET` | Sim | Assinatura de sessão. |
| `OAUTH_SERVER_URL` | Sim quando OAuth estiver ativo | Endpoint de autenticação. |
| `VITE_APP_ID` | Sim quando OAuth estiver ativo | Identificador público da aplicação. |
| `VITE_OAUTH_PORTAL_URL` | Sim quando OAuth estiver ativo | Portal de login. |
| `BUILT_IN_FORGE_API_URL` | Conforme plataforma | Serviços de armazenamento e integrações. |
| `BUILT_IN_FORGE_API_KEY` | Conforme plataforma | Credencial servidor-servidor. |

Em qualquer ambiente, usar uma URL de base de dados com TLS quando o provedor o exigir.
