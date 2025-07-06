# Docker 配置指南

## 概述

本專案提供了完整的 Docker 配置，包括：
- PostgreSQL 資料庫
- Redis 緩存（可選）
- NestJS 後端應用
- 開發和生產環境的不同配置

## 檔案說明

### Docker 相關檔案
- `Dockerfile` - 生產環境的 Docker 映像
- `Dockerfile.dev` - 開發環境的 Docker 映像
- `docker-compose.yml` - 生產環境的 Docker Compose 配置
- `docker-compose.dev.yml` - 開發環境的 Docker Compose 配置
- `.dockerignore` - Docker 構建時忽略的檔案
- `init-db.sql` - 資料庫初始化腳本
- `.env.docker` - Docker 環境變量模板

## 使用方法

### 1. 開發環境

```bash
# 啟動開發環境（包含 hot reload）
npm run docker:dev

# 或者直接使用 docker-compose
docker-compose -f docker-compose.dev.yml up --build
```

### 2. 生產環境

```bash
# 啟動生產環境
npm run docker:prod

# 或者直接使用 docker-compose
docker-compose up --build
```

### 3. 其他常用命令

```bash
# 停止所有容器
npm run docker:stop

# 查看日誌
npm run docker:logs

# 僅構建映像
npm run docker:build

# 單獨運行後端容器
npm run docker:run
```

## 環境變數配置

1. 複製 `.env.docker` 為 `.env`
2. 修改 Google OAuth 相關設定：
   ```env
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   ```

## 資料庫配置

### PostgreSQL
- 預設用戶：`chatroom_user`
- 預設密碼：`chatroom_password`
- 預設資料庫：`chatroom_db`
- 連接端口：`5432`

### Redis
- 連接端口：`6379`
- 無密碼（開發環境）

## 健康檢查

應用提供了健康檢查端點：
- URL: `http://localhost:3000/health`
- 返回格式：`{"status": "ok", "timestamp": "2024-01-01T00:00:00.000Z"}`

## 網路配置

- 生產環境：`chatroom-network`
- 開發環境：`chatroom-dev-network`

## 資料持久化

- PostgreSQL 資料：`postgres_data` volume（生產）/ `postgres_dev_data` volume（開發）
- 開發環境還會掛載源代碼目錄以支持 hot reload

## 注意事項

1. **安全性**：
   - 生產環境使用非特權用戶運行
   - 敏感資訊應通過環境變數傳遞
   - 請更改預設密碼

2. **效能**：
   - 使用 Alpine 基底映像減少大小
   - 多階段構建優化映像
   - 啟用健康檢查

3. **開發**：
   - 開發環境支持 hot reload
   - 原始碼目錄會被掛載到容器中
   - 包含完整的開發依賴

## 故障排除

### 常見問題

1. **端口衝突**：
   - 確保 3000、5432、6379 端口未被占用
   - 可以修改 docker-compose.yml 中的端口映射

2. **資料庫連接失敗**：
   - 檢查 PostgreSQL 容器是否正常啟動
   - 確認環境變數配置正確

3. **Google OAuth 問題**：
   - 確保 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET 已正確設定
   - 檢查 callback URL 是否正確

### 日誌查看

```bash
# 查看所有容器日誌
docker-compose logs

# 查看特定容器日誌
docker-compose logs backend
docker-compose logs postgres
docker-compose logs redis
```

### 清理資源

```bash
# 停止並刪除容器
docker-compose down

# 刪除 volumes（會清除資料庫數據）
docker-compose down -v

# 清理所有相關映像
docker-compose down --rmi all
```