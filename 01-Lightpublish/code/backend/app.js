// backend/app.js

// 1. 引入需要的包
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./config/db');  // 添加数据库连接

// 2. 引入路由文件
const commentsRouter = require('./routes/comments');  // 添加这行

// 3. 创建Express应用
const app = express();

// 4. 使用中间件
app.use(cors());  // 允许跨域
app.use(express.json());  // 解析JSON格式的请求体

// ===== 工具函数 =====
// 简单密码哈希（使用 SHA256）
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password + 'lightpublish_salt').digest('hex');
};

// 生成简单 token
const generateToken = (userId, phone) => {
  const data = `${userId}:${phone}:${Date.now()}`;
  return crypto.createHash('sha256').update(data + 'token_secret').digest('hex');
};

// ===== 认证接口 =====

// 注册接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 基本验证
    if (!phone || !password) {
      return res.status(400).json({ code: 400, message: '手机号和密码不能为空' });
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 400, message: '手机号格式不正确' });
    }
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({ code: 400, message: '密码长度为6-20位' });
    }

    // 检查手机号是否已注册
    const [existing] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0) {
      return res.status(409).json({ code: 409, message: '手机号已注册' });
    }

    // 创建用户
    const hashedPassword = hashPassword(password);
    const username = '用户' + phone.slice(-4);
    const [result] = await db.query(
      'INSERT INTO users (phone, password, username, created_at) VALUES (?, ?, ?, NOW())',
      [phone, hashedPassword, username]
    );

    const userId = result.insertId;
    const token = generateToken(userId, phone);
    const user = { id: userId, phone, username };

    res.json({
      code: 200,
      message: '注册成功',
      data: { token, user }
    });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 基本验证
    if (!phone || !password) {
      return res.status(400).json({ code: 400, message: '手机号和密码不能为空' });
    }

    // 查找用户
    const [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const user = users[0];

    // 验证密码
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' });
    }

    // 生成 token
    const token = generateToken(user.id, phone);
    const userInfo = { id: user.id, phone: user.phone, username: user.username };

    res.json({
      code: 200,
      message: '登录成功',
      data: { token, user: userInfo }
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'LightPublish 后端服务器运行正常！',
    data: {
      name: 'LightPublish API',
      version: '1.0.0'
    }
  });
});

// 6. 另一个测试路由
app.get('/api/test', (req, res) => {
  res.json({
    code: 200,
    message: '测试接口成功',
    data: {
      time: new Date().toLocaleString(),
      author: '你的名字'
    }
  });
});

// 7. 文章详情接口 - 连接到真实数据库
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查询文章详情
    const [articles] = await db.query(
      `SELECT * FROM articles WHERE id = ?`,
      [id]
    );
    
    if (articles.length === 0) {
      return res.json({
        code: 404,
        message: '文章不存在'
      });
    }
    
    const article = articles[0];
    
    // 转换tags格式（字符串转数组）
    let tags = [];
    if (article.tags) {
      tags = article.tags.split(',').map(tag => tag.trim());
    }
    
    // 格式化返回数据
    const articleDetails = {
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      author: article.author,
      tags: tags,
      publishTime: article.publish_time,
      updateTime: article.update_time,
      views: article.views,
      likes: article.likes,
      commentCount: article.comment_count
    };
    
    res.json({
      code: 200,
      message: '获取文章详情成功',
      data: articleDetails
    });
    
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.json({
      code: 500,
      message: '服务器错误'
    });
  }
});

// 8. 点赞接口
app.post('/api/articles/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 更新数据库中的点赞数
    await db.query(
      'UPDATE articles SET likes = likes + 1 WHERE id = ?',
      [id]
    );
    
    // 获取更新后的点赞数
    const [result] = await db.query(
      'SELECT likes FROM articles WHERE id = ?',
      [id]
    );
    
    res.json({
      code: 200,
      message: '点赞成功',
      data: {
        id: parseInt(id),
        likes: result[0].likes
      }
    });
    
  } catch (error) {
    console.error('点赞失败:', error);
    res.json({
      code: 500,
      message: '点赞失败'
    });
  }
});

// 9. 使用评论路由（重要！这行必须放在所有路由定义之后，但在启动服务器之前）
app.use('/api/comments', commentsRouter);

// 10. 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ 后端服务器启动成功！`);
  console.log(`🌐 访问地址：http://localhost:${PORT}`);
  console.log(`📡 测试接口：http://localhost:${PORT}/api/test`);
  console.log(`📚 文章接口：http://localhost:${PORT}/api/articles/1`);
  console.log(`💬 评论接口：http://localhost:${PORT}/api/comments?articleId=1`);
});