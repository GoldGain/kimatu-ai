# Kimatu AI

Autonomous multi-agent workspace scaffold (Next.js + TypeScript + DeepSeek-compatible API).

Kimatu is designed as a **production-oriented foundation** for:

- Conversational AI (orchestrator)
- Planner / Coding / Research / Testing / Deployment agents
- Chat workspace + code projects
- Plugin connectors (GitHub, Supabase, Vercel, filesystem, PDF)
- Supabase SQL schema with RLS + pgvector hook
- Secure env-based secrets (no hardcoded keys)

> This repository is an **MVP scaffold**. It is intentionally not a full clone of Cursor/Manus in one commit. Core architecture, UI shell, APIs, agents, and migrations are in place so you can iterate safely.

## Security (read first)

If any API keys, GitHub PATs, or Supabase keys were pasted into chat or prompts:

1. **Revoke/rotate them immediately** in DeepSeek, GitHub, and Supabase dashboards.
2. Put replacements **only** in `.env.local` or your host’s secret manager.
3. Never commit `.env.local` (already gitignored).

This codebase does **not** embed secrets.

## Stack

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Zustand
- **AI:** DeepSeek via OpenAI-compatible client (`openai` SDK)
- **Data:** In-memory store for local demo; Supabase migration for production
- **Deploy target:** Vercel

## Quick start

```bash
npm install
cp .env.example .env.local
# edit .env.local — add DEEPSEEK_API_KEY (and optional Supabase keys)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `DEEPSEEK_API_KEY`, chat runs in **demo mode** with local agent routing responses.

### Health check

```bash
curl http://localhost:3000/api/health
```

## App routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/login`, `/signup` | Auth UI scaffolds |
| `/dashboard` | Usage + quick actions |
| `/chat`, `/chat/[id]` | Multi-agent chat |
| `/code` | Code workspace |
| `/projects` | Project list |
| `/plugins` | Connector marketplace |
| `/settings` | Env configuration status |
| `/admin` | System overview |

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Runtime + config flags |
| `POST` | `/api/chat` | Agent turn (`stream: true` for SSE) |
| `GET/POST` | `/api/conversations` | List / create |
| `GET/DELETE` | `/api/conversations/:id` | Read / delete |
| `GET/POST` | `/api/projects` | List / create projects |

### Chat body example

```json
{
  "message": "Plan a secure SaaS MVP",
  "agent": "planner",
  "stream": false
}
```

`agent` optional values: `orchestrator` | `planner` | `coding` | `research` | `testing` | `deployment`.

## Agents

Located in `src/lib/agents/`:

- **Orchestrator** — default routing + general answers  
- **Planner** — execution plans  
- **Coding** — implementation-focused  
- **Research** — briefs and synthesis  
- **Testing** — QA plans  
- **Deployment** — ship checklists  

Keyword routing lives in `detectAgent()`; override from the chat UI chips.

## Supabase

1. Create a Supabase project (e.g. `kimatu-agent`).
2. Run `supabase/migrations/001_init.sql` in the SQL editor.
3. Set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The app currently uses an in-memory store so you can develop offline. Swap `src/lib/db/memory-store.ts` callers to Supabase when auth is wired.

## Project layout

```text
src/
  app/                 # routes + API
  components/          # UI, chat, landing, layout
  lib/
    agents/            # prompts + orchestrator
    ai/                # DeepSeek client
    connectors/        # plugin interfaces
    db/                # memory store + supabase helpers
    memory/            # short-term + naive RAG hooks
  store/               # zustand
  types/
supabase/migrations/
```

## Deploy (Vercel)

1. Push this repo to GitHub **using your own credentials** (do not embed PATs in code).
2. Import the repo in Vercel.
3. Add the same env vars from `.env.example`.
4. Deploy.

```bash
npm run build
```

## Roadmap (recommended order)

1. Supabase Auth on login/signup + session middleware  
2. Persist conversations/messages/projects in Postgres  
3. Real tool-calling loop (function calls → connectors)  
4. Monaco editor + sandboxed preview  
5. pgvector embeddings pipeline  
6. BullMQ jobs for long-running agent runs  
7. Billing / rate limits  

## License

Private / proprietary unless you set otherwise.
