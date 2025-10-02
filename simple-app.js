// 簡単な動作確認用サーバー
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 簡易的なルーティング
const routes = {
  '/': {
    html: `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CRM Task Manager</title>
        <style>
          body { font-family: sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
          .card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
          button { background: #0070f3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          button:hover { background: #0051cc; }
          input { padding: 8px; margin: 5px 0; width: 100%; border: 1px solid #ddd; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>CRM Task Manager - ローカルテスト</h1>
        <div class="card">
          <h2>新規登録</h2>
          <form id="registerForm">
            <input type="email" id="regEmail" placeholder="メールアドレス" required>
            <input type="password" id="regPassword" placeholder="パスワード" required>
            <input type="text" id="regName" placeholder="名前">
            <button type="submit">登録</button>
          </form>
          <div id="regResult"></div>
        </div>
        
        <div class="card">
          <h2>ログイン</h2>
          <form id="loginForm">
            <input type="email" id="loginEmail" placeholder="メールアドレス" required>
            <input type="password" id="loginPassword" placeholder="パスワード" required>
            <button type="submit">ログイン</button>
          </form>
          <div id="loginResult"></div>
        </div>

        <div class="card" id="dashboard" style="display:none;">
          <h2>ダッシュボード</h2>
          <p>ログイン成功！</p>
          <button onclick="logout()">ログアウト</button>
        </div>

        <script>
          document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const name = document.getElementById('regName').value;
            
            const response = await fetch('/api/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, name })
            });
            
            const result = await response.json();
            document.getElementById('regResult').innerHTML = result.success 
              ? '<p style="color:green">登録成功！</p>' 
              : '<p style="color:red">エラー: ' + result.error + '</p>';
          });

          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            if (result.success) {
              document.getElementById('loginResult').innerHTML = '<p style="color:green">ログイン成功！</p>';
              document.getElementById('dashboard').style.display = 'block';
              localStorage.setItem('user', JSON.stringify(result.user));
            } else {
              document.getElementById('loginResult').innerHTML = '<p style="color:red">エラー: ' + result.error + '</p>';
            }
          });

          function logout() {
            localStorage.removeItem('user');
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('loginResult').innerHTML = '';
          }

          // ページ読み込み時にユーザー情報を確認
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            document.getElementById('dashboard').style.display = 'block';
          }
        </script>
      </body>
      </html>
    `
  }
};

// 簡易的なデータベース（メモリ内）
let users = [];

// サーバー作成
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // HTMLページ
  if (req.method === 'GET' && routes[req.url]) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(routes[req.url].html);
    return;
  }

  // API: 登録
  if (req.method === 'POST' && req.url === '/api/register') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password, name } = JSON.parse(body);
        
        // 既存ユーザーチェック
        if (users.find(u => u.email === email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'ユーザーは既に存在します' }));
          return;
        }

        // ユーザー作成
        const user = {
          id: crypto.randomUUID(),
          email,
          password: crypto.createHash('sha256').update(password).digest('hex'),
          name: name || 'ユーザー'
        };
        users.push(user);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          user: { id: user.id, email: user.email, name: user.name }
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // API: ログイン
  if (req.method === 'POST' && req.url === '/api/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (!user) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'メールアドレスまたはパスワードが正しくありません' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          user: { id: user.id, email: user.email, name: user.name }
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`🚀 簡易テストサーバーが起動しました: http://localhost:${PORT}`);
  console.log('📝 テストユーザー作成済み:');
  
  // テストユーザーを作成
  users.push({
    id: crypto.randomUUID(),
    email: 'test@example.com',
    password: crypto.createHash('sha256').update('password123').digest('hex'),
    name: 'テストユーザー'
  });
  
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
});