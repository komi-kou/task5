#!/usr/bin/env node
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// 環境変数を設定
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'development-secret-key';
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Next.jsアプリケーションの作成
const app = next({ 
  dev,
  dir: __dirname,
  hostname,
  port
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`
🚀 Next.js Application Ready!
-----------------------------
URL: http://${hostname}:${port}
Environment: ${dev ? 'development' : 'production'}
Database: ${process.env.DATABASE_URL}

Test User:
  Email: test@example.com
  Password: password123
      `);
    });
});