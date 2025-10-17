const fetch = require('node-fetch');

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  
  // 1. 新規登録テスト
  console.log('🔵 新規登録テスト開始...');
  const uniqueEmail = `test_${Date.now()}@example.com`;
  
  try {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'testpass123',
        name: 'Test User'
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ 新規登録成功:', registerData.message);
      console.log('   ユーザーID:', registerData.user.id);
      console.log('   メール:', registerData.user.email);
    } else {
      console.log('❌ 新規登録失敗:', registerData.error);
    }
  } catch (error) {
    console.log('❌ 新規登録エラー:', error.message);
  }
  
  // 2. 既存ユーザーでのログインテスト
  console.log('\n🔵 ログインテスト開始...');
  
  try {
    // CSRFトークンを取得
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    
    // ログイン
    const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `next-auth.csrf-token=${csrfData.csrfToken}`
      },
      body: new URLSearchParams({
        email: 'test@example.com',
        password: 'test123',
        csrfToken: csrfData.csrfToken
      })
    });
    
    if (loginResponse.status === 302 || loginResponse.status === 200) {
      console.log('✅ ログイン成功');
      console.log('   ステータス:', loginResponse.status);
      console.log('   リダイレクト先:', loginResponse.headers.get('location') || 'なし');
    } else {
      console.log('❌ ログイン失敗');
      console.log('   ステータス:', loginResponse.status);
    }
  } catch (error) {
    console.log('❌ ログインエラー:', error.message);
  }
  
  // 3. ダッシュボードへのアクセステスト
  console.log('\n🔵 ダッシュボードアクセステスト...');
  
  try {
    const dashboardResponse = await fetch(`${baseUrl}/dashboard`);
    
    console.log('📊 ダッシュボードレスポンス:');
    console.log('   ステータス:', dashboardResponse.status);
    console.log('   URL:', dashboardResponse.url);
    
    if (dashboardResponse.url.includes('/login')) {
      console.log('   → ログインページにリダイレクトされました（認証が必要）');
    } else if (dashboardResponse.ok) {
      console.log('   → ダッシュボードにアクセスできます');
    }
  } catch (error) {
    console.log('❌ ダッシュボードアクセスエラー:', error.message);
  }
}

// テスト実行
console.log('🚀 認証フローテスト開始\n');
console.log('================================\n');
testAuth().then(() => {
  console.log('\n================================');
  console.log('✨ テスト完了\n');
});