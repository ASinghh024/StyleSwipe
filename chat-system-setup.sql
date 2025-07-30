-- StyleSwipe Real-time Chat System Database Setup
-- Creates tables and policies for user-stylist messaging

-- 1. Create chat_rooms table
-- Each room represents a conversation between a user and stylist
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stylist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id) -- One chat room per match
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for chat_rooms
-- Users and stylists can only access their own chat rooms
CREATE POLICY "Users can access their chat rooms" ON chat_rooms
  FOR ALL USING (
    auth.uid() = user_id OR auth.uid() = stylist_id
  );

-- 5. Create RLS policies for messages  
-- Users can only access messages in their chat rooms
CREATE POLICY "Users can access messages in their chat rooms" ON messages
  FOR ALL USING (
    chat_room_id IN (
      SELECT id FROM chat_rooms 
      WHERE auth.uid() = user_id OR auth.uid() = stylist_id
    )
  );

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_match_id ON chat_rooms(match_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_stylist_id ON chat_rooms(stylist_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- 7. Create function to update chat room timestamp when new message is sent
CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET updated_at = NOW() 
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to auto-update chat room timestamp
DROP TRIGGER IF EXISTS update_chat_room_on_message ON messages;
CREATE TRIGGER update_chat_room_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_timestamp();

-- 9. Create function to automatically create chat room when first message is sent
CREATE OR REPLACE FUNCTION create_chat_room_if_not_exists(
  p_match_id UUID,
  p_user_id UUID,
  p_stylist_id UUID
) RETURNS UUID AS $$
DECLARE
  room_id UUID;
BEGIN
  -- Try to find existing chat room
  SELECT id INTO room_id 
  FROM chat_rooms 
  WHERE match_id = p_match_id;
  
  -- If no room exists, create one
  IF room_id IS NULL THEN
    INSERT INTO chat_rooms (match_id, user_id, stylist_id)
    VALUES (p_match_id, p_user_id, p_stylist_id)
    RETURNING id INTO room_id;
  END IF;
  
  RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 11. Verify setup
SELECT 'CHAT SYSTEM SETUP COMPLETE' as status;
SELECT 
  'Created tables: ' || COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_name IN ('chat_rooms', 'messages') 
AND table_schema = 'public';