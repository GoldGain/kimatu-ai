# Deployment

## Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Production build

```bash
npm run build
npm start
```

## Vercel

1. Create GitHub repo (empty or existing).
2. Authenticate with the GitHub CLI or SSH — **do not put PATs in the repository**.
3. Push:

```bash
git init
git add .
git commit -m "Initial Kimatu AI scaffold"
git branch -M main
git remote add origin git@github.com:YOUR_ORG/Kimatu-ai-agent.git
git push -u origin main
```

4. In Vercel → Import project → set env vars from `.env.example`.
5. Deploy.

## Supabase

1. Create project in a region close to users (e.g. `eu-central-1` for Kenya/EAT).
2. SQL → run `supabase/migrations/001_init.sql`.
3. Auth → enable Email provider.
4. Copy Project URL + anon key into Vercel env.

## Rotation checklist

If credentials ever leaked in chat:

- DeepSeek: revoke key, create new  
- GitHub: revoke PAT, create fine-scoped token  
- Supabase: rotate anon/service keys if exposed  
