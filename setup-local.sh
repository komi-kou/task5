#!/bin/bash

# ローカル開発環境のセットアップ

echo "ローカル開発環境をセットアップします..."

# 1. 環境変数の設定
cat > .env.local << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="local-development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
EOF

# 2. Prismaのセットアップ
echo "データベースを初期化中..."
npx prisma db push --schema=./prisma/schema.dev.prisma --skip-generate

# 3. Prismaクライアントの生成
echo "Prismaクライアントを生成中..."
npx prisma generate --schema=./prisma/schema.dev.prisma

echo "セットアップが完了しました。"
echo "開発サーバーを起動するには: npm run dev"