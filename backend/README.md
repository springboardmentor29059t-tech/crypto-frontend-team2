# Crypto Guardian Backend (Starter)

Lightweight Express + TypeScript API that mirrors the current frontend screens (auth, holdings, trades, exchanges, alerts, settings) using in-memory demo data.

## Quick start
```bash
cd backend
npm install
cp env.example .env   # update JWT_SECRET if needed
npm run dev           # starts on http://localhost:4000
```

## Routes
- `GET /health`
- `POST /auth/register` — returns `{token,user}`
- `POST /auth/login` — returns `{token,user}`
- `GET /auth/me` — requires `Authorization: Bearer <token>`
- `GET /holdings` — protected
- `GET /trades` — protected
- `GET /alerts` — protected
- `GET /exchanges` — protected
- `POST /exchanges/connect` — protected, body `{id, apiKey, apiSecret}`
- `POST /exchanges/disconnect/:id` — protected
- `GET /settings` — protected
- `PUT /settings` — protected, replaces settings

## Notes
- Data now persists to `database.json` (users + revokedTokens). For production, replace with a real database.
- JWT secret defaults to `JWT_SECRET` env var; change it for production.
- Validation uses `zod`; minimal error handling is included.

