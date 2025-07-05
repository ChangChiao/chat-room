-- 用戶表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- 聊天室成員表索引
CREATE INDEX idx_chat_room_members_user_id ON chat_room_members(user_id);
CREATE INDEX idx_chat_room_members_chat_room_id ON chat_room_members(chat_room_id);
CREATE INDEX idx_chat_room_members_joined_at ON chat_room_members(joined_at);

-- 訊息表索引
CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_chat_room_created ON messages(chat_room_id, created_at);

-- 用戶會話表索引
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_socket_id ON user_sessions(socket_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);