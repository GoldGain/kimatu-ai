# Deploy Kimatu AI to Vercel

Repo: https://github.com/GoldGain/kimatu-ai

1. https://vercel.com/new → import **GoldGain/kimatu-ai**
2. Framework: Next.js
3. Env vars (required):
   - DEEPSEEK_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
4. Deploy → free `*.vercel.app`

No demo mode: missing keys make `/api/health` return 503 and chat fail closed.
