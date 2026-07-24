-- Kimatu production hardening patch
-- Ensure plugin config has stable slugs for connector mapping

UPDATE plugins
SET config = COALESCE(config, '{}'::jsonb) || jsonb_build_object(
  'slug', CASE
    WHEN lower(name) LIKE '%github%' THEN 'github'
    WHEN lower(name) LIKE '%supabase%' THEN 'supabase'
    WHEN lower(name) LIKE '%vercel%' THEN 'vercel'
    WHEN lower(name) LIKE '%browser%' THEN 'browser'
    WHEN lower(name) LIKE '%file%' THEN 'filesystem'
    WHEN lower(name) LIKE '%pdf%' THEN 'pdf'
    ELSE COALESCE(config->>'slug', id::text)
  END,
  'category', COALESCE(config->>'category', 'General'),
  'icon', COALESCE(config->>'icon', 'puzzle')
);

-- Helpful indexes if missing
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
