/*
  # Secure the AI assistant tables

  ## Why
  The anon key ships in the browser bundle, so any table in `public` without
  Row Level Security can be read and written by anyone who has it.

  - `support_chat_messages` is where SupportChat.tsx stores conversations,
    but no migration created it.
  - `chat_history` and `devices_catalog` were created without RLS.

  ## Changes
  1. Create `support_chat_messages` if it does not exist, matching what
     SupportChat.tsx reads and writes:
     - `id` (text) - message id from crypto.randomUUID() or a fallback string
     - `user_id` (uuid, FK) - owner of the conversation
     - `sender` (text) - 'user' or 'bot'
     - `text` (text) - message body
     - `at` (bigint) - Date.now() in milliseconds
  2. Enable RLS on `support_chat_messages` and `chat_history`: users can only
     read and insert their own messages. No update or delete policies, since
     the app does not use them.
  3. Enable RLS on `devices_catalog`: everyone can read it, nobody can write
     to it from the client.

  Safe to run more than once.
*/

-- 1. Chat table used by the app
CREATE TABLE IF NOT EXISTS public.support_chat_messages (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user', 'bot')),
  text text NOT NULL,
  at bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS support_chat_messages_user_idx
  ON public.support_chat_messages(user_id, at);

-- 2. Chat tables: only your own messages
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat messages" ON public.support_chat_messages;
CREATE POLICY "Users can view own chat messages"
  ON public.support_chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.support_chat_messages;
CREATE POLICY "Users can insert own chat messages"
  ON public.support_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own chat history" ON public.chat_history;
CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat history" ON public.chat_history;
CREATE POLICY "Users can insert own chat history"
  ON public.chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Device catalog: public read-only
ALTER TABLE public.devices_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view the devices catalog" ON public.devices_catalog;
CREATE POLICY "Anyone can view the devices catalog"
  ON public.devices_catalog FOR SELECT
  TO anon, authenticated
  USING (true);
