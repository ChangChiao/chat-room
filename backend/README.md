# 即時聊天室後端 API

使用 NestJS、PostgreSQL 和 Socket.io 開發的即時聊天室應用。

## 功能特色

- ✅ Google OAuth 2.0 第三方登入
- ✅ JWT 身份驗證
- ✅ 即時訊息通訊 (Socket.io)
- ✅ 一對一私聊
- ✅ 群組聊天（最多 30 人）
- ✅ 訊息歷史記錄
- ✅ 線上狀態追蹤
- ✅ 打字狀態顯示
- ✅ 錯誤處理和日誌系統

## 技術堆疊

- **框架**: NestJS
- **資料庫**: PostgreSQL + TypeORM
- **即時通訊**: Socket.io
- **認證**: Passport.js (JWT + Google OAuth)
- **驗證**: class-validator
- **日誌**: NestJS Logger

## 安裝與設定

### 1. 環境需求

- Node.js >= 14
- PostgreSQL >= 12
- npm 或 yarn

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境設定

複製 `.env.example` 到 `.env` 並設定以下變數：

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=chatroom_user
DATABASE_PASSWORD=chatroom_password
DATABASE_NAME=chatroom_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION_TIME=3600

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# App
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### 4. 建立資料庫

```bash
# 使用提供的腳本
./scripts/setup-database.sh

# 或手動建立
psql -U postgres
CREATE USER chatroom_user WITH PASSWORD 'chatroom_password';
CREATE DATABASE chatroom_db OWNER chatroom_user;
GRANT ALL PRIVILEGES ON DATABASE chatroom_db TO chatroom_user;
\q
```

### 5. 啟動應用

```bash
# 開發模式
npm run start:dev

# 生產模式
npm run build
npm run start:prod
```

## API 文件

### 認證 API

#### 註冊
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### 登入
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Google OAuth 登入
```http
GET /auth/google
```

#### 回應格式
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### 用戶 API

#### 獲取用戶資料
```http
GET /users/profile
Authorization: Bearer {token}
```

### 聊天室 API

#### 建立聊天室
```http
POST /chat/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "private",  // 或 "group"
  "name": "群組名稱",  // 群組必填
  "description": "群組描述",  // 選填
  "memberIds": ["user-id-1", "user-id-2"]
}
```

#### 獲取用戶聊天室列表
```http
GET /chat/rooms
Authorization: Bearer {token}
```

#### 獲取聊天室詳情
```http
GET /chat/rooms/{roomId}
Authorization: Bearer {token}
```

#### 獲取聊天室訊息
```http
GET /chat/rooms/{roomId}/messages?page=1&limit=50
Authorization: Bearer {token}
```

#### 加入成員
```http
POST /chat/rooms/{roomId}/members/{userId}
Authorization: Bearer {token}
```

#### 移除成員
```http
DELETE /chat/rooms/{roomId}/members/{userId}
Authorization: Bearer {token}
```

#### 標記已讀
```http
POST /chat/rooms/{roomId}/read
Authorization: Bearer {token}
```

## WebSocket 事件

### 連線
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

### 客戶端事件

#### join-room
```javascript
socket.emit('join-room', { roomId: 'room-uuid' });
```

#### leave-room
```javascript
socket.emit('leave-room', { roomId: 'room-uuid' });
```

#### send-message
```javascript
socket.emit('send-message', {
  content: '訊息內容',
  chatRoomId: 'room-uuid',
  type: 'text'
});
```

#### typing
```javascript
socket.emit('typing', {
  roomId: 'room-uuid',
  isTyping: true
});
```

### 服務器事件

#### new-message
```javascript
socket.on('new-message', (data) => {
  console.log(data);
  // {
  //   id: 'message-uuid',
  //   content: '訊息內容',
  //   type: 'text',
  //   createdAt: '2023-01-01T00:00:00.000Z',
  //   sender: { id, name, avatar },
  //   chatRoomId: 'room-uuid'
  // }
});
```

#### user-joined / user-left
```javascript
socket.on('user-joined', (data) => {
  console.log(`${data.name} 加入聊天室`);
});
```

#### user-online / user-offline
```javascript
socket.on('user-online', (data) => {
  console.log(`${data.name} 上線了`);
});
```

#### user-typing
```javascript
socket.on('user-typing', (data) => {
  if (data.isTyping) {
    console.log(`${data.name} 正在輸入...`);
  }
});
```

#### error
```javascript
socket.on('error', (data) => {
  console.error(data.message);
});
```

## 測試

### 單元測試
```bash
npm run test
```

### E2E 測試
```bash
npm run test:e2e
```

### Socket.io 測試頁面
訪問 http://localhost:3000/test-socket.html

## 資料庫架構

詳見 [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)

## 錯誤處理

應用程式包含完整的錯誤處理機制：

- HTTP 異常過濾器
- WebSocket 異常過濾器
- 全域驗證管道
- 詳細的錯誤日誌

## 安全性

- JWT Token 驗證
- 密碼使用 bcrypt 加密
- 輸入驗證和消毒
- CORS 設定
- 環境變數保護

## 部署

### Docker
```bash
docker build -t chatroom-backend .
docker run -p 3000:3000 --env-file .env chatroom-backend
```

### PM2
```bash
npm run build
pm2 start dist/main.js --name chatroom-backend
```

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 授權

MIT License