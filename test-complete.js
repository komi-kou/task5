#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

const PORT = 3003;
const BASE_URL = `http://localhost:${PORT}`;

// カラーコード
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAPI() {
  log('\n=== API テスト開始 ===', 'cyan');
  
  // 1. 新規登録テスト
  log('\n📝 新規登録テスト', 'yellow');
  try {
    const registerData = JSON.stringify({
      email: 'test_' + Date.now() + '@example.com',
      password: 'password123',
      name: 'テストユーザー'
    });
    
    const result = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
      },
      body: registerData
    });
    
    if (result.status === 200) {
      log('✅ 新規登録: 成功', 'green');
      log(`   ユーザー: ${result.data.user?.email}`, 'green');
    } else {
      log(`❌ 新規登録: 失敗 (Status: ${result.status})`, 'red');
      log(`   エラー: ${result.data.error || result.data}`, 'red');
    }
  } catch (error) {
    log(`❌ 新規登録: エラー - ${error.message}`, 'red');
  }
  
  // 2. ログインテスト
  log('\n🔐 ログインテスト', 'yellow');
  try {
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const result = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      body: loginData
    });
    
    if (result.status === 200 || result.status === 302) {
      log('✅ ログイン: 成功', 'green');
    } else {
      log(`⚠️ ログイン: Status ${result.status}`, 'yellow');
    }
  } catch (error) {
    log(`❌ ログイン: エラー - ${error.message}`, 'red');
  }
  
  // 3. ページアクセステスト
  log('\n📄 ページアクセステスト', 'yellow');
  const pages = [
    { url: '/', name: 'ホーム' },
    { url: '/login', name: 'ログイン' },
    { url: '/dashboard', name: 'ダッシュボード' },
    { url: '/customers', name: '顧客管理' },
    { url: '/tasks', name: 'タスク管理' },
    { url: '/leads', name: 'リード管理' },
    { url: '/opportunities', name: '商談管理' }
  ];
  
  for (const page of pages) {
    try {
      const result = await makeRequest(`${BASE_URL}${page.url}`, {
        method: 'GET'
      });
      
      if (result.status === 200 || result.status === 307) {
        log(`✅ ${page.name}: アクセス可能 (Status: ${result.status})`, 'green');
      } else {
        log(`⚠️ ${page.name}: Status ${result.status}`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${page.name}: エラー - ${error.message}`, 'red');
    }
  }
}

async function startDevServer() {
  log('\n🚀 開発サーバー起動中...', 'blue');
  
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['standalone-server.js'], {
      cwd: __dirname,
      env: { 
        ...process.env, 
        PORT: PORT.toString(),
        NODE_ENV: 'development'
      },
      stdio: 'pipe'
    });
    
    let started = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') && !started) {
        started = true;
        log('✅ サーバー起動完了', 'green');
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    server.on('error', reject);
    
    // タイムアウト
    setTimeout(() => {
      if (!started) {
        reject(new Error('Server startup timeout'));
      }
    }, 30000);
  });
}

async function main() {
  log('===================================', 'cyan');
  log('  CRM Task Manager - 完全テスト  ', 'cyan');
  log('===================================', 'cyan');
  
  let server = null;
  
  try {
    // サーバー起動
    server = await startDevServer();
    
    // サーバーが完全に起動するまで待機
    await wait(5000);
    
    // APIテスト実行
    await testAPI();
    
    log('\n✅ テスト完了', 'green');
    
  } catch (error) {
    log(`\n❌ テスト失敗: ${error.message}`, 'red');
  } finally {
    if (server) {
      log('\n🔚 サーバー停止中...', 'yellow');
      server.kill();
    }
    process.exit(0);
  }
}

// 実行
if (require.main === module) {
  main();
}