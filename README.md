# Kimatu AI

Production multi-agent workspace: **Next.js 14 + DeepSeek + Supabase**.

There is **no demo mode**. Chat and data APIs require real environment secrets.

## Security

- Never hardcode API keys.
- Never commit `.env.local`.
- Rotate any key that was pasted into chat historically.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.

## Stack

- Next.js App Router, TypeScript, Tailwind
- DeepSeek OpenAI-compatible API
- Supabase Postgres (+ RLS-ready schema, pgvector hook)
- Multi-agent orchestrator (planner, coding, research, testing, deployment)

## Setup

```bash
npm install
cp .env.example .env.local
# fill DEEPSEEK_* and Supabase keys
```

### Supabase SQL (required)

1. Create/open project `kimatu-agent`
2. SQL editor → run `supabase/migrations/001_init.sql`
3. Copy Project URL, anon key, service role key into `.env.local`

```bash
npm run dev
```

Health: `GET /api/health` returns 200 only when DeepSeek + Supabase are configured.

## Deploy (Vercel free domain)

1. Import https://github.com/GoldGain/kimatu-ai
2. Set the same env vars in Vercel
3. Deploy → `*.vercel.app`

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/dashboard` | Live Supabase stats |
| `/chat` | Multi-agent chat (DeepSeek) |
| `/code` | Code workspace |
| `/projects` | Projects |
| `/plugins` | Connectors |
| `/settings` | Config status |
| `/admin` | System overview |

## API

- `POST /api/chat` — real DeepSeek completion (fails hard without key)
- `GET/POST /api/conversations`
- `GET/DELETE /api/conversations/:id`
- `GET/POST /api/projects`
- `GET /api/health`
