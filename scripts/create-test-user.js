const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createTestUser() {
  const db = new sqlite3.Database('./dev.db');
  
  const userId = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO User (id, email, password, name, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    db.run(sql, [userId, 'test@example.com', hashedPassword, 'テストユーザー', 'user'], function(err) {
      if (err) {
        console.error('Error creating user:', err);
        reject(err);
      } else {
        console.log('✅ Test user created:');
        console.log('   Email: test@example.com');
        console.log('   Password: password123');
        resolve();
      }
      db.close();
    });
  });
}

createTestUser().catch(console.error);