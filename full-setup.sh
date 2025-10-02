#!/bin/bash

echo "🔧 完全セットアップを開始..."

# 1. 既存のファイルをクリーンアップ
echo "🗑️  既存ファイルをクリーンアップ中..."
rm -rf node_modules package-lock.json dev.db dev.db-journal 2>/dev/null

# 2. npmキャッシュをクリア
echo "🧹 npmキャッシュをクリア中..."
npm cache clean --force

# 3. 依存関係をインストール
echo "📦 依存関係をインストール中..."
npm install --legacy-peer-deps

# 4. データベースを作成
echo "💾 データベースを作成中..."
sqlite3 dev.db < init-db.sql

# 5. Prismaクライアントを生成
echo "🔨 Prismaクライアントを生成中..."
npx prisma generate --schema=./prisma/schema.dev.prisma || npx prisma generate

# 6. 初期データを投入
echo "📝 初期データを作成中..."
node init-local.js

echo "✅ セットアップ完了！"
echo "🚀 開発サーバーを起動: npm run dev"