const db = require('./config/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✅ 数据库连接成功！', rows);
    
    const [articles] = await db.query('SELECT COUNT(*) as count FROM articles');
    console.log(`📚 文章表有 ${articles[0].count} 条记录`);
    
    const [comments] = await db.query('SELECT COUNT(*) as count FROM comments');
    console.log(`💬 评论表有 ${comments[0].count} 条记录`);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

testConnection();