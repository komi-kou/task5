const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up deployment environment...');
console.log('====================================\n');

// 1. Prismaスキーマの修正
console.log('📄 Step 1: Configuring Prisma schema for PostgreSQL...');
const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const productionSchemaPath = path.join(__dirname, '../prisma/schema.production.prisma');

try {
  // 本番用スキーマが存在する場合はコピー
  if (fs.existsSync(productionSchemaPath)) {
    console.log('   ✓ Found production schema, copying...');
    const productionSchema = fs.readFileSync(productionSchemaPath, 'utf8');
    fs.writeFileSync(schemaPath, productionSchema);
    console.log('   ✓ Production schema copied successfully');
  } else {
    // 存在しない場合は直接修正
    console.log('   ⚠ Production schema not found, updating provider...');
    if (fs.existsSync(schemaPath)) {
      let schema = fs.readFileSync(schemaPath, 'utf8');
      
      // SQLiteからPostgreSQLに変更
      if (schema.includes('provider = "sqlite"')) {
        schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
        fs.writeFileSync(schemaPath, schema);
        console.log('   ✓ Updated provider from sqlite to postgresql');
      } else if (schema.includes('provider = "postgresql"')) {
        console.log('   ✓ Provider is already set to postgresql');
      } else {
        console.log('   ⚠ Unknown provider, please check schema.prisma manually');
      }
    } else {
      console.error('   ✗ schema.prisma not found!');
      process.exit(1);
    }
  }
} catch (error) {
  console.error('   ✗ Error updating Prisma schema:', error.message);
  process.exit(1);
}

// 2. [...nextauth]フォルダの作成
console.log('\n📁 Step 2: Setting up NextAuth.js route...');
const authDir = path.join(__dirname, '../app/api/auth');
const nextAuthDir = path.join(authDir, '[...nextauth]');

try {
  // フォルダが存在しない場合のみ作成
  if (!fs.existsSync(nextAuthDir)) {
    console.log('   ⚠ [...nextauth] directory not found, creating...');
    fs.mkdirSync(nextAuthDir, { recursive: true });
    console.log('   ✓ Created [...nextauth] directory');
    
    // route.tsファイルを作成
    const routePath = path.join(nextAuthDir, 'route.ts');
    const routeContent = `import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
`;
    
    fs.writeFileSync(routePath, routeContent);
    console.log('   ✓ Created route.ts file');
  } else {
    console.log('   ✓ [...nextauth] directory already exists');
    
    // route.tsが存在するか確認
    const routePath = path.join(nextAuthDir, 'route.ts');
    if (!fs.existsSync(routePath)) {
      console.log('   ⚠ route.ts not found, creating...');
      const routeContent = `import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
`;
      fs.writeFileSync(routePath, routeContent);
      console.log('   ✓ Created route.ts file');
    } else {
      console.log('   ✓ route.ts file exists');
    }
  }
} catch (error) {
  console.error('   ✗ Error setting up NextAuth.js:', error.message);
  process.exit(1);
}

// 3. 不要なフォルダの削除（オプション）
console.log('\n🧹 Step 3: Cleaning up...');
const nextauthDir = path.join(authDir, 'nextauth');
if (fs.existsSync(nextauthDir)) {
  try {
    fs.rmSync(nextauthDir, { recursive: true, force: true });
    console.log('   ✓ Removed temporary nextauth directory');
  } catch (error) {
    console.log('   ⚠ Could not remove temporary directory:', error.message);
  }
} else {
  console.log('   ✓ No cleanup needed');
}

// 4. 環境変数の確認
console.log('\n🔐 Step 4: Verifying environment variables...');
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
let envValid = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✓ ${envVar} is set`);
    if (envVar === 'DATABASE_URL' && process.env[envVar].includes('postgresql://')) {
      console.log('     └─ PostgreSQL URL detected');
    }
  } else {
    console.log(`   ✗ ${envVar} is NOT set`);
    envValid = false;
  }
});

if (!envValid) {
  console.log('\n⚠️  Warning: Some environment variables are missing.');
  console.log('   Please set them in your Render dashboard.');
}

// 完了
console.log('\n====================================');
console.log('✨ Deployment setup complete!');
console.log('====================================\n');

// デバッグ情報
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  console.log('📊 Deployment Information:');
  console.log(`   Platform: ${process.env.RENDER ? 'Render' : 'Other'}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Current Directory: ${process.cwd()}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
}