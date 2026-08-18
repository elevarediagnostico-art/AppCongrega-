# CONGREGA / Igreja Jornada — PRD

## Problem statement
Importar do GitHub e continuar o desenvolvimento do app "CONGREGA / Igreja Jornada" (a URL do STATUS_PROJETO.md dava 404; o código veio no zip `igreja-jornada-final-integrado.zip`). Colocar rodando ponta a ponta neste ambiente.

## Tech stack (imported)
- Frontend: React 19 + Vite 7 + Wouter + TanStack Query + tRPC client + Radix UI + Tailwind 4
- Backend: Express + tRPC + Drizzle ORM (MySQL/MariaDB) + Zod
- Auth: **Emergent-managed Google Auth** (replaced the original external OAuth portal). Session = JWT cookie `app_session_id` (signed with JWT_SECRET).
- DB: MariaDB local (`igreja_jornada`), user `congrega`.
- Monolith adapted to run split: backend API on :8001 (`API_ONLY=true`), Vite dev server on :3000. Supervisor programs `backend`, `frontend`, `mariadb`.

## User personas / roles (per church membership)
- Membro: jornada diária (Palavra/Plano Bíblico, devocional, sequência, agenda, oração, conexões, EBD).
- Pastor: métricas + sinais de cuidado pastoral (care.*), relatórios.
- Administrador: gestão de conteúdo (avisos/eventos/devocional/EBD/galeria), relatórios, moderação, dashboard.
Multi-tenant: dados isolados por `churchId`; backend valida membership + role (rbac.ts) em toda operação.

## Environment decisions
- User choices: (1) rodar ponta a ponta; (2) Google Login (Emergent); (3) MySQL local + seed (Membro/Pastor/Admin); (4) integrações LLM/imagem/voz com a chave universal Emergent (pendente).
- `/etc/supervisor/conf.d/supervisord.conf` foi adaptado (backend=tsx node, frontend=vite, +mariadb). NOTE: pode ser resetado em resume do pod — se o app parar após resume, re-aplicar.

## Done (2026-06)
- [x] Importado e reorganizado o monólito em /app.
- [x] pnpm install; MariaDB instalado/rodando; DB + migrações Drizzle aplicadas.
- [x] Auth externa substituída por Emergent Google Auth (POST /api/auth/session, main.tsx trata #session_id, startLogin -> auth.emergentagent.com, sdk.authenticateRequest simplificado).
- [x] Auto-enroll de demo: usuário Google sem membership entra na igreja demo (1º vira admin).
- [x] Seed: igreja demo + 3 usuários (admin/pastor/member) + plano bíblico + devocional do dia + evento + aviso + inscrições no plano.
- [x] Supervisor rodando backend(:8001) + vite(:3000) + mariadb.
- [x] Testado: 27/27 backend (auth, tenancy, RBAC, member journey, management, reports, care); frontend welcome + home autenticado + rotas.

## Done (2026-06, sessão 2)
- [x] Landing page pública implementada fiel ao design enviado (`client/src/pages/Landing.tsx`): fontes Fraunces+Inter, paleta papel/vinho/ouro, hero com mock de celular, seções Por que/Problema/Pilares/Membro/Pastor/Admin/Privacidade, preços (4 planos), FAQ, CTA final e footer. Substitui a antiga tela "Welcome" para usuários não autenticados (Home.tsx). Todos os CTAs "Experimentar/Entrar" disparam o login Google (startLogin -> auth.emergentagent.com), validado por screenshot.

## Backlog (próximas features — do mais simples ao mais complexo)
- P1: Reativar integrações com a chave universal Emergent — AIChatBox (LLM), geração de imagem, transcrição de voz, e storage de upload (galeria/fotos) — hoje ainda apontam para a Forge API da Manus e falham só ao usar.
- P1: Plano Bíblico 365 dias (catálogo completo) e Pão Diário administrável.
- P2: Frequência individual EBD, notificações, Revista EBD trimestral, moderação de Conexões — completar itens pendentes do todo.md.
- P2: Refino de UI/UX das páginas admin/pastor.

## Notes for testing
- Ver /app/memory/test_credentials.md (tokens JWT Bearer / cookie app_session_id).
- Regenerar seed/tokens: `cd /app && node_modules/.bin/tsx scripts/seed_demo.ts`.
- tRPC + superjson: respostas em `result.data.json`; erros em `error.json.data.code`.
