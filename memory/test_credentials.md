# Test Credentials — CONGREGA / Igreja Jornada

Auth: **Emergent-managed Google Auth**. There are no app-managed passwords. For automated/API testing, use the JWT session tokens below (they never require a Google account).

## How to authenticate in tests
- Cookie name: `app_session_id` (httpOnly, secure, sameSite=none), OR
- HTTP header: `Authorization: Bearer <session_token>`

Session tokens are JWTs signed with `JWT_SECRET`. Regenerate any time with:
`cd /app && node_modules/.bin/tsx scripts/seed_demo.ts`

## Demo church
- name: Comunidade CONGREGA — slug: `congrega-demo` — id: 1

## Seeded users (role via membership + user.role)
| Role | Email (openId) | openId |
|---|---|---|
| Administrador | admin@congrega.demo | admin-demo |
| Pastor | pastor@congrega.demo | pastor-demo |
| Membro | member@congrega.demo | member-demo |

## Latest session tokens (Bearer)
- administrator: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbi1kZW1vIiwiYXBwSWQiOiJjb25ncmVnYSIsIm5hbWUiOiJBbmEgQWRtaW5pc3RyYWRvcmEiLCJleHAiOjE4MTg2MDY2ODZ9.eyRkabydCbxhE4Idd8VYg9hItYoYe2DOfiWryGca2Wg
- pastor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJwYXN0b3ItZGVtbyIsImFwcElkIjoiY29uZ3JlZ2EiLCJuYW1lIjoiUGF1bG8gUGFzdG9yIiwiZXhwIjoxODE4NjA2Njg2fQ.c0PTqaKoo_qNwHRdd7vhSeEbA_wnM5x2UwIMrIKL3js
- member: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJtZW1iZXItZGVtbyIsImFwcElkIjoiY29uZ3JlZ2EiLCJuYW1lIjoiTWFyY29zIE1lbWJybyIsImV4cCI6MTgxODYwNjY4Nn0.3hAXL73xYr3DunrkwBD18gwJqBYnVm2iSEskEUcuh7k

Note: On real Google login, any new user with no membership is auto-enrolled into the demo church (first user without an admin becomes administrator; others become member). Controlled by `DEMO_AUTOENROLL` in `/app/.env`.
