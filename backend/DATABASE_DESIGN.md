# 資料庫設計文件

## 資料表結構

### 1. users (用戶表)
- **id**: UUID (主鍵)
- **email**: VARCHAR (唯一索引)
- **googleId**: VARCHAR (可空，Google OAuth ID)
- **name**: VARCHAR (顯示名稱)
- **avatar**: VARCHAR (頭像 URL)
- **password**: VARCHAR (可空，本地註冊用戶密碼)
- **isGoogleUser**: BOOLEAN (是否為 Google 用戶)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

### 2. chat_rooms (聊天室表)
- **id**: UUID (主鍵)
- **name**: VARCHAR (群組名稱，私聊可為空)
- **type**: ENUM ('private', 'group')
- **maxMembers**: INTEGER (預設 30)
- **avatar**: VARCHAR (群組頭像)
- **description**: TEXT (群組描述)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

### 3. chat_room_members (聊天室成員表)
- **id**: UUID (主鍵)
- **chatRoomId**: UUID (外鍵 -> chat_rooms)
- **userId**: UUID (外鍵 -> users)
- **role**: ENUM ('admin', 'member')
- **joinedAt**: TIMESTAMP
- **lastReadAt**: TIMESTAMP (最後讀取時間)
- 唯一索引: (chatRoomId, userId)

### 4. messages (訊息表)
- **id**: UUID (主鍵)
- **chatRoomId**: UUID (外鍵 -> chat_rooms)
- **senderId**: UUID (外鍵 -> users，可空用於系統訊息)
- **content**: TEXT
- **type**: ENUM ('text', 'image', 'file', 'system')
- **fileUrl**: VARCHAR (檔案 URL)
- **fileName**: VARCHAR (檔案名稱)
- **isEdited**: BOOLEAN
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

### 5. user_sessions (用戶會話表)
- **id**: UUID (主鍵)
- **userId**: UUID (外鍵 -> users)
- **socketId**: VARCHAR (Socket.io 連線 ID)
- **status**: ENUM ('online', 'offline', 'away')
- **lastActivity**: TIMESTAMP
- **connectedAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

## 關係說明

1. **User <-> ChatRoom** (多對多)
   - 透過 chat_room_members 表建立關聯
   - 一個用戶可以加入多個聊天室
   - 一個聊天室可以有多個成員

2. **User -> Message** (一對多)
   - 一個用戶可以發送多則訊息
   - 訊息的發送者可以為空（系統訊息）

3. **ChatRoom -> Message** (一對多)
   - 一個聊天室包含多則訊息

4. **User -> UserSession** (一對多)
   - 一個用戶可以有多個活躍會話（多裝置登入）

## 業務規則

1. **私聊聊天室**
   - type = 'private'
   - 只能有 2 個成員
   - name 欄位通常為空

2. **群組聊天室**
   - type = 'group'
   - 最多 30 個成員
   - 必須有名稱

3. **訊息類型**
   - text: 純文字訊息
   - image: 圖片訊息
   - file: 檔案訊息
   - system: 系統訊息（如：xxx 加入聊天室）

4. **成員角色**
   - admin: 管理員（可以管理成員、修改群組資訊）
   - member: 一般成員

## 效能優化

1. **索引策略**
   - users.email (唯一索引)
   - users.googleId (條件索引)
   - chat_room_members.(userId, chatRoomId)
   - messages.(chatRoomId, createdAt) (複合索引)
   - user_sessions.socketId

2. **查詢優化建議**
   - 使用分頁載入歷史訊息
   - 快取用戶線上狀態
   - 定期清理過期的會話記錄