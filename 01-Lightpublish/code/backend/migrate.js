const db = require('./config/db');

async function migrate() {
  try {
    await db.query('ALTER TABLE users MODIFY COLUMN email varchar(100) NULL COMMENT \'邮箱\'');
    console.log('✅ email 字段改为可选成功');
  } catch(e) {
    console.log('email 修改:', e.message);
  }
  try {
    await db.query('ALTER TABLE users ADD UNIQUE KEY uk_phone (phone)');
    console.log('✅ phone 唯一索引添加成功');
  } catch(e) {
    console.log('phone 索引:', e.message);
  }
  process.exit(0);
}

migrate();
