-- Kimatu AI production schema
-- Run in Supabase SQL editor for project "kimatu-agent"

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Workspace tables support service-role server writes before full auth is enabled.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  credits INTEGER DEFAULT 100000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) DEFAULT 'New Conversation',
  model VARCHAR(80) DEFAULT 'deepseek-chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  agent VARCHAR(40),
  token_usage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path VARCHAR(500) NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, path)
);

CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  token_used INTEGER DEFAULT 0,
  cost NUMERIC(12, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_user ON embeddings(user_id);

INSERT INTO plugins (name, description, enabled, config)
SELECT * FROM (VALUES
  ('GitHub Connector', 'Connect GitHub repositories for code management', true, '{"category":"DevOps","icon":"github"}'::jsonb),
  ('Supabase Connector', 'Connect Supabase database for data operations', true, '{"category":"Data","icon":"database"}'::jsonb),
  ('Vercel Connector', 'Deploy applications to Vercel', true, '{"category":"Deploy","icon":"rocket"}'::jsonb),
  ('Browser Automation', 'Control browser for web testing', false, '{"category":"Automation","icon":"globe"}'::jsonb),
  ('File System', 'Manage files and directories', true, '{"category":"Workspace","icon":"folder"}'::jsonb),
  ('PDF Analyzer', 'Analyze PDF documents', true, '{"category":"Documents","icon":"file-text"}'::jsonb)
) AS v(name, description, enabled, config)
WHERE NOT EXISTS (SELECT 1 FROM plugins LIMIT 1);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles_self" ON profiles;
  DROP POLICY IF EXISTS "conversations_owner" ON conversations;
  DROP POLICY IF EXISTS "messages_via_conversation" ON messages;
  DROP POLICY IF EXISTS "projects_owner" ON projects;
  DROP POLICY IF EXISTS "files_via_project" ON files;
  DROP POLICY IF EXISTS "usage_owner" ON usage_tracking;
  DROP POLICY IF EXISTS "embeddings_owner" ON embeddings;
  DROP POLICY IF EXISTS "plugins_read" ON plugins;
  DROP POLICY IF EXISTS "conversations_service" ON conversations;
  DROP POLICY IF EXISTS "messages_service" ON messages;
  DROP POLICY IF EXISTS "projects_service" ON projects;
  DROP POLICY IF EXISTS "files_service" ON files;
  DROP POLICY IF EXISTS "usage_service" ON usage_tracking;
  DROP POLICY IF EXISTS "plugins_service" ON plugins;
  DROP POLICY IF EXISTS "profiles_service" ON profiles;
  DROP POLICY IF EXISTS "embeddings_service" ON embeddings;
END $$;

-- Authenticated user policies (when Supabase Auth is enabled)
CREATE POLICY "profiles_self" ON profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "conversations_owner" ON conversations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "messages_via_conversation" ON messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "projects_owner" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "files_via_project" ON files
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = files.project_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = files.project_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "usage_owner" ON usage_tracking
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "embeddings_owner" ON embeddings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plugins_read" ON plugins
  FOR SELECT TO authenticated
  USING (true);

-- NOTE: service_role bypasses RLS automatically in Supabase.
-- Server routes must use SUPABASE_SERVICE_ROLE_KEY for production writes.
