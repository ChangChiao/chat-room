# API 測試指南

## 設定

確保 .env 檔案已設定：
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=chatroom_user
DATABASE_PASSWORD=chatroom_password
DATABASE_NAME=chatroom_db

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION_TIME=3600

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

PORT=3000
FRONTEND_URL=http://localhost:3001
```

## 認證 API 測試

### 1. 用戶註冊
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. 用戶登入
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. 獲取用戶資料
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Google OAuth 登入
在瀏覽器中訪問：
```
http://localhost:3000/auth/google
```

## Google OAuth 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 Google+ API
4. 創建 OAuth 2.0 憑證
5. 設定授權重定向 URI：`http://localhost:3000/auth/google/callback`
6. 將 Client ID 和 Client Secret 填入 .env 檔案

## 預期回應格式

### 成功登入回應：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### 用戶資料回應：
```json
{
  "id": "uuid",
  "email": "test@example.com",
  "name": "Test User",
  "avatar": "https://example.com/avatar.jpg",
  "isGoogleUser": false,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

## 常見錯誤

### 401 Unauthorized
- JWT token 無效或已過期
- 需要重新登入

### 409 Conflict
- 註冊時 email 已存在

### 500 Internal Server Error
- 資料庫連線問題
- 檢查 PostgreSQL 是否運行並且設定正確