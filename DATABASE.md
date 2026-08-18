# Base de dados

O esquema reside em `drizzle/schema.ts`. As migrações SQL são geradas em `drizzle/` e devem ser aplicadas pelo comando `pnpm drizzle-kit migrate`.

## Domínios

| Domínio | Entidades principais |
| --- | --- |
| Identidade e tenancy | `users`, `churches`, `memberships`, `roles`, `permissions` |
| Comunidade | `events`, `event_registrations`, `announcements`, `albums`, `photos` |
| Jornada | `bible_plans`, `bible_readings`, `user_bible_plan_enrollments`, `user_bible_progress`, `daily_devotionals`, `church_contents`, `milestones` |
| Participação | `ebd_classes`, `ebd_lessons`, `ebd_enrollments`, `attendances`, `ebd_magazines` |
| Cuidado | `prayer_requests`, `pastoral_signals`, `activity_events` |
| Conexões | `professional_listings`, `families`, `family_members` |

## Regras de integridade

As tabelas de progresso, frequência, matrículas, marcos e registos de evento possuem índices ou chaves únicas para impedir duplicidade. O check-in de EBD é único por combinação de aula e utilizador. O Plano Bíblico associa leituras a planos e cada progresso a uma inscrição.

Os sinais pastorais conservam apenas observações objetivas, período analisado, estado e responsáveis pela revisão. O modelo não contém diagnósticos espirituais.

## Evolução do esquema

1. Alterar `drizzle/schema.ts`.
2. Executar `pnpm drizzle-kit generate`.
3. Rever o SQL gerado, especialmente alterações de enums e chaves estrangeiras.
4. Executar `pnpm drizzle-kit migrate`.
5. Verificar as novas tabelas e relações antes de publicar.

Não usar `db:push --force` em produção.
