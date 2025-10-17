const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 開発環境のセットアップを開始します...\n');

// 環境変数ファイルのチェック
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 .envファイルを作成します...');
  const envContent = `DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .envファイルを作成しました\n');
}

// 既存のデータベースファイルを削除
const dbPath = path.join(process.cwd(), 'dev.db');
const dbJournalPath = path.join(process.cwd(), 'dev.db-journal');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  既存のdev.dbを削除しました');
}

if (fs.existsSync(dbJournalPath)) {
  fs.unlinkSync(dbJournalPath);
  console.log('🗑️  既存のdev.db-journalを削除しました');
}

// ローカル開発用のスキーマファイルがあるか確認
const devSchemaPath = path.join(process.cwd(), 'prisma', 'schema.dev.prisma');
const schemaPath = fs.existsSync(devSchemaPath) ? devSchemaPath : path.join(process.cwd(), 'prisma', 'schema.prisma');

console.log('\n📦 Prismaデータベースをセットアップ中...');

try {
  // Prismaデータベースのプッシュ
  console.log('データベースのスキーマを適用中...');
  execSync(`npx prisma db push --schema=${schemaPath} --skip-generate`, { stdio: 'inherit' });
  
  // Prismaクライアントの生成
  console.log('\nPrismaクライアントを生成中...');
  execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });
  
  console.log('\n✅ データベースのセットアップが完了しました！');
  console.log('\n🚀 開発サーバーを起動するには以下を実行してください:');
  console.log('   npm run dev\n');
  
} catch (error) {
  console.error('\n❌ セットアップ中にエラーが発生しました:', error.message);
  process.exit(1);
}