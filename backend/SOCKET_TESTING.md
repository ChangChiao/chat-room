# Socket.IO 測試指南

## WebSocket 事件說明

### 客戶端發送的事件

1. **join-room** - 加入聊天室
   ```javascript
   socket.emit('join-room', { roomId: 'room-uuid' });
   ```

2. **leave-room** - 離開聊天室
   ```javascript
   socket.emit('leave-room', { roomId: 'room-uuid' });
   ```

3. **send-message** - 發送訊息
   ```javascript
   socket.emit('send-message', {
     content: '訊息內容',
     chatRoomId: 'room-uuid',
     type: 'text'
   });
   ```

4. **typing** - 打字狀態
   ```javascript
   socket.emit('typing', {
     roomId: 'room-uuid',
     isTyping: true
   });
   ```

### 服務器發送的事件

1. **new-message** - 新訊息
   ```javascript
   {
     id: 'message-uuid',
     content: '訊息內容',
     type: 'text',
     createdAt: '2023-01-01T00:00:00.000Z',
     sender: {
       id: 'user-uuid',
       name: '用戶名稱',
       avatar: 'avatar-url'
     },
     chatRoomId: 'room-uuid'
   }
   ```

2. **user-joined** - 用戶加入
   ```javascript
   {
     userId: 'user-uuid',
     name: '用戶名稱',
     avatar: 'avatar-url'
   }
   ```

3. **user-left** - 用戶離開
   ```javascript
   {
     userId: 'user-uuid',
     name: '用戶名稱'
   }
   ```

4. **user-online** - 用戶上線
   ```javascript
   {
     userId: 'user-uuid',
     name: '用戶名稱',
     avatar: 'avatar-url'
   }
   ```

5. **user-offline** - 用戶下線
   ```javascript
   {
     userId: 'user-uuid'
   }
   ```

6. **user-typing** - 用戶打字狀態
   ```javascript
   {
     userId: 'user-uuid',
     name: '用戶名稱',
     isTyping: true
   }
   ```

7. **error** - 錯誤訊息
   ```javascript
   {
     message: '錯誤描述'
   }
   ```

## 測試步驟

### 1. 準備工作
1. 啟動服務器：`npm run start:dev`
2. 打開測試頁面：http://localhost:3000/test-socket.html
3. 獲取 JWT Token（透過登入 API）

### 2. 連線測試
1. 在測試頁面輸入 JWT Token
2. 點擊「連線」按鈕
3. 查看連線狀態是否變為「已連線」

### 3. 聊天室測試
1. 建立聊天室（使用 REST API）
2. 獲取聊天室 ID
3. 在測試頁面輸入聊天室 ID 並加入

### 4. 訊息測試
1. 在訊息輸入框輸入內容
2. 點擊「發送」或按 Enter
3. 查看訊息是否正確顯示

### 5. 多用戶測試
1. 開啟多個瀏覽器視窗
2. 使用不同用戶 Token 連線
3. 加入相同聊天室
4. 測試即時訊息同步

## REST API 端點

### 建立聊天室
```bash
curl -X POST http://localhost:3000/chat/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "private",
    "memberIds": ["other-user-id"]
  }'
```

### 獲取用戶聊天室
```bash
curl -X GET http://localhost:3000/chat/rooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 獲取聊天室訊息
```bash
curl -X GET "http://localhost:3000/chat/rooms/{roomId}/messages?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 注意事項

1. **認證**：所有 WebSocket 連線都需要有效的 JWT Token
2. **權限**：用戶只能加入自己是成員的聊天室
3. **訊息持久化**：所有訊息都會自動儲存到資料庫
4. **房間管理**：用戶連線時會自動加入所有相關聊天室
5. **錯誤處理**：無效操作會觸發 'error' 事件

## 常見問題

### WebSocket 連線失敗
- 檢查 JWT Token 是否有效
- 確認用戶在資料庫中存在

### 無法加入聊天室
- 檢查用戶是否為聊天室成員
- 確認聊天室 ID 是否正確

### 訊息發送失敗
- 確認已加入聊天室
- 檢查訊息格式是否正確