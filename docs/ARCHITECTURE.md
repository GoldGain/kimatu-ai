# Kimatu AI Architecture

## Goals

Provide a modular agent platform where:

1. A user message is classified or explicitly routed to a specialist agent.
2. The agent runs against DeepSeek (OpenAI-compatible chat completions).
3. Conversation state is stored (memory store now; Supabase next).
4. Connectors expose external capabilities behind a common interface.
5. UI surfaces chat, code, plugins, settings, and admin views.

## Request path (chat)

```text
Browser ChatWorkspace
  → POST /api/chat
    → validate (zod)
    → load/create conversation (memory-store)
    → append user message
    → runAgentTurn / streamAgentTurn
        → detectAgent or forced agent
        → buildPlan
        → DeepSeek complete/stream OR demo fallback
    → append assistant message
    → JSON or SSE response
```

## Agent layer

| Component | Role |
|-----------|------|
| `prompts.ts` | System prompts per agent |
| `orchestrator.ts` | Routing, planning, demo mode, streaming |
| `deepseek.ts` | API client factory |

Agents are **prompt specialists** in this MVP. A later iteration should add a shared tool registry and multi-step loop (plan → tool → observe → answer).

## Data layer

**Now:** process-local `Map` store (`memory-store.ts`) — great for demos, resets on server restart.

**Next:** Supabase tables from `001_init.sql` with RLS keyed on `auth.uid()`.

## Connectors

`src/lib/connectors` defines:

- `isConfigured()` — env presence
- `run(action, input)` — stubbed execution

Wire real SDKs (Octokit, Supabase client, Vercel API) without changing UI contracts.

## Memory

- Short-term: ring buffer per conversation id  
- RAG: `naiveRetrieve` placeholder → replace with pgvector similarity  

## Security boundaries

- Browser never receives service-role keys.
- DeepSeek key only on server (`process.env`).
- Auth pages are UI-only until Supabase Auth is connected.
- Rate limiting should sit in front of `/api/chat` before production traffic.

## Why not everything at once?

Full parity with Cursor/Manus requires sandboxed compute, durable queues, auth, billing, and hardened tool execution. This scaffold optimizes for a **correct, runnable spine** you can extend without rewriting.
