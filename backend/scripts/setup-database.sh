#!/bin/bash

# 資料庫設定
DB_NAME="chatroom_db"
DB_USER="chatroom_user"
DB_PASSWORD="chatroom_password"

echo "Setting up PostgreSQL database..."

# 建立資料庫使用者
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# 建立資料庫
psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# 授予權限
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "Database setup completed!"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: $DB_PASSWORD"