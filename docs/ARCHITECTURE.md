# Kimatu AI Architecture (production)

## Request path (chat)

```text
Browser ChatWorkspace
  → POST /api/chat
    → assertProductionConfig()  # DeepSeek + Supabase required
    → validate (zod)
    → create/load conversation (Supabase)
    → append user message
    → runAgentTurn / streamAgentTurn → DeepSeek API
    → append assistant message + usage_tracking
    → JSON or SSE response
```

## Data

All durable state is in Supabase via `src/lib/db/repository.ts`.

There is no in-memory demo fallback.

## Agents

Prompt specialists in `src/lib/agents/` with keyword routing + UI override.

## Secrets

Only `process.env`. Never commit keys.
