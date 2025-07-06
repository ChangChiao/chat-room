-- 初始化資料庫腳本
-- 這個腳本會在 PostgreSQL 容器啟動時執行

-- 創建必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 可以在這裡添加其他初始化 SQL 語句
-- 例如：創建索引、插入初始數據等

-- 創建用戶表的索引（如果需要）
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 創建聊天室表的索引
-- CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);
-- CREATE INDEX IF NOT EXISTS idx_chats_owner_id ON chats(owner_id);

-- 創建消息表的索引
-- CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
-- CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
-- CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 插入測試數據（可選）
-- INSERT INTO users (id, email, name, google_id, created_at, updated_at) 
-- VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'test_google_id', NOW(), NOW())
-- ON CONFLICT (email) DO NOTHING;