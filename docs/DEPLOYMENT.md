# Deployment

## Required env

- DEEPSEEK_API_KEY
- DEEPSEEK_BASE_URL (optional)
- DEEPSEEK_MODEL (optional, default deepseek-chat)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Supabase

Run `supabase/migrations/001_init.sql` in the SQL editor before first traffic.

## Vercel

Import `GoldGain/kimatu-ai`, set env vars, deploy. Free `*.vercel.app` domain is automatic.
