const bcrypt = require('bcryptjs');

// テスト用のパスワードをチェック
const testPassword = async () => {
  const passwords = [
    'password123',
    'testpass123', 
    'test123',
    'password',
    'test'
  ];

  // 既知のテストユーザーのパスワードハッシュ
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (user) {
      console.log('User found:', user.email);
      console.log('Testing passwords...');
      
      for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, user.password);
        if (isValid) {
          console.log(`✅ Valid password found: ${pwd}`);
          break;
        } else {
          console.log(`❌ Invalid: ${pwd}`);
        }
      }
    }

    // 新しいテストユーザーを作成
    console.log('\nCreating new test user with known password...');
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    // 既存のユーザーを更新
    const updated = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Updated test@example.com with password: test123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testPassword();