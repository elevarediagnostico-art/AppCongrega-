# Emergent Google Auth — Testing Playbook (adapted for Node/Express + MySQL)

This app uses Emergent-managed Google Auth. Backend is Node.js/Express + tRPC + Drizzle (MySQL), NOT Python/Mongo.

## Flow
1. Frontend login button -> `https://auth.emergentagent.com/?redirect=<origin>/` (redirect derived from window.location.origin, never hardcoded).
2. User returns to `<origin>/#session_id=<id>`.
3. Frontend detects `session_id` in URL fragment (synchronously during render), POSTs it to backend `/api/auth/session`.
4. Backend calls `https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data` with header `X-Session-ID: <session_id>`.
   Response: `{ id, email, name, picture, session_token }`.
5. Backend upserts user (by email/openId), stores session_token in `sessions` table with 7-day expiry, sets httpOnly cookie (secure, sameSite=none, path=/).
6. Protected tRPC procedures read the session cookie (fallback: Authorization Bearer), resolve the user.

## Manual backend test (curl)
```
BASE=$(node -e "console.log(process.env.APP_URL||'')")
# Seeded test session token exists in DB (see below). Use it as Bearer.
curl -s "$BASE/api/trpc/auth.me" -H "Authorization: Bearer <SESSION_TOKEN>"
```

## Seeding a test session (MySQL)
A helper script `scripts/seed_test_session.ts` inserts a church, a user (role configurable) and a session row, printing the session_token. Use that token as a cookie/Bearer for automated tests.

Browser test: set cookie `session` (COOKIE_NAME) = session_token, domain = app host, path=/, httpOnly, secure, sameSite=None, then navigate.

## Test identities
See /app/memory/test_credentials.md for seeded users and roles (Membro, Pastor, Administrador).
