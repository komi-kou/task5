const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🚀 ローカル開発環境の初期化を開始...');
  
  // Prismaクライアントを初期化
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./dev.db'
      }
    }
  });

  try {
    // データベース接続を確認
    await prisma.$connect();
    console.log('✅ データベースに接続しました');

    // 既存のデータを削除
    await prisma.user.deleteMany();
    console.log('🗑️  既存のユーザーデータを削除しました');

    // テストユーザーを作成
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'テストユーザー',
        role: 'admin'
      }
    });

    console.log('✅ テストユーザーを作成しました:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');

    // サンプルデータを作成
    // 顧客データ
    const customer1 = await prisma.customer.create({
      data: {
        name: '株式会社サンプル',
        email: 'sample@example.com',
        phone: '03-1234-5678',
        company: '株式会社サンプル',
        address: '東京都千代田区',
        status: 'active',
        notes: 'VIP顧客',
        contractAmount: 5000000,
        industry: 'IT',
        employeeCount: 100,
        annualRevenue: 1000000000,
        userId: testUser.id
      }
    });

    const customer2 = await prisma.customer.create({
      data: {
        name: 'テスト商事',
        email: 'test@test.com',
        phone: '06-9876-5432',
        company: 'テスト商事株式会社',
        address: '大阪府大阪市',
        status: 'active',
        contractAmount: 3000000,
        industry: '製造業',
        employeeCount: 50,
        annualRevenue: 500000000,
        userId: testUser.id
      }
    });

    console.log('✅ サンプル顧客を作成しました');

    // タスクデータ
    await prisma.task.create({
      data: {
        title: '提案書作成',
        description: '新規プロジェクトの提案書を作成する',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後
        assignee: 'テストユーザー',
        category: '営業',
        progress: 30,
        userId: testUser.id,
        customerId: customer1.id
      }
    });

    await prisma.task.create({
      data: {
        title: 'ミーティング準備',
        description: '月例ミーティングの資料準備',
        status: 'not_started',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3日後
        category: '管理',
        userId: testUser.id
      }
    });

    console.log('✅ サンプルタスクを作成しました');

    // リードデータ
    await prisma.lead.create({
      data: {
        name: '新規リード株式会社',
        email: 'lead@newcompany.com',
        phone: '03-5555-5555',
        company: '新規リード株式会社',
        source: 'ウェブサイト',
        status: 'new',
        score: 75,
        userId: testUser.id
      }
    });

    console.log('✅ サンプルリードを作成しました');

    // 商談データ
    await prisma.opportunity.create({
      data: {
        name: '大型システム導入案件',
        amount: 10000000,
        stage: 'proposal',
        probability: 60,
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        description: '基幹システムの全面リニューアル',
        userId: testUser.id,
        customerId: customer1.id
      }
    });

    console.log('✅ サンプル商談を作成しました');

    console.log('\n🎉 ローカル開発環境の初期化が完了しました！');
    console.log('\n📝 ログイン情報:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('\n🚀 開発サーバーを起動: npm run dev');

  } catch (error) {
    console.error('❌ エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 直接実行された場合のみ実行
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { main };