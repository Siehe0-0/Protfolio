// backend/app.js
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./config/db');

// 引入路由
const articlesRouter  = require('./routes/articles');
const commentsRouter  = require('./routes/comments');
const usersRouter     = require('./routes/users');
const tagsRouter      = require('./routes/tags');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// ===== 工具函数 =====
const hashPassword = (password) =>
  crypto.createHash('sha256').update(password + 'lightpublish_salt').digest('hex');

const generateToken = (userId, identifier) => {
  const data = `${userId}:${identifier}:${Date.now()}`;
  return crypto.createHash('sha256').update(data + 'token_secret').digest('hex');
};

// ===== 认证接口 =====

// 注册（手机号必填，邮箱可选）
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!phone || !password)
      return res.status(400).json({ code: 400, message: '手机号和密码不能为空' });
    if (!/^1[3-9]\d{9}$/.test(phone))
      return res.status(400).json({ code: 400, message: '手机号格式不正确' });
    if (password.length < 6 || password.length > 20)
      return res.status(400).json({ code: 400, message: '密码长度为6-20位' });

    const [existing] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existing.length > 0)
      return res.status(409).json({ code: 409, message: '手机号已注册' });

    const hashedPassword = hashPassword(password);
    const finalUsername = username || '用户' + phone.slice(-4);
    // email 传空字符串时存 null，数据库已改为允许 NULL
    const [result] = await db.query(
      'INSERT INTO users (phone, email, password_hash, username) VALUES (?, ?, ?, ?)',
      [phone, email || null, hashedPassword, finalUsername]
    );

    const userId = result.insertId;
    const token = generateToken(userId, phone);
    const user = { id: userId, phone, email: email || null, username: finalUsername };

    res.json({ code: 200, message: '注册成功', data: { token, user } });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 登录（支持手机号 或 邮箱）
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    if (!password || (!phone && !email))
      return res.status(400).json({ code: 400, message: '账号和密码不能为空' });

    let users;
    if (phone) {
      [users] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    } else {
      [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    }

    if (users.length === 0)
      return res.status(404).json({ code: 404, message: '用户不存在' });

    const user = users[0];
    const hashedPassword = hashPassword(password);
    if (user.password_hash !== hashedPassword)
      return res.status(401).json({ code: 401, message: '账号或密码错误' });

    const token = generateToken(user.id, phone || email);
    const userInfo = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      username: user.username,
      avatar: user.avatar || null
    };

    res.json({ code: 200, message: '登录成功', data: { token, user: userInfo } });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// ===== 注册业务路由 =====
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/users',    usersRouter);
app.use('/api/tags',     tagsRouter);

// ===== 根路由 =====
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: 'LightPublish 后端服务运行正常',
    data: {
      name: 'LightPublish API',
      version: '2.0.0',
      routes: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET/POST /api/articles',
        'GET/PUT/DELETE /api/articles/:id',
        'POST /api/articles/:id/like',
        'GET/POST /api/comments',
        'POST /api/comments/:id/like',
        'GET/PUT /api/users/:id',
        'GET /api/users/:id/stats',
        'GET /api/users/:id/articles',
        'GET /api/users/:id/activities',
        'GET /api/users/:id/chart',
        'GET /api/users/:id/history',
        'GET /api/tags',
        'GET /api/tags/hot'
      ]
    }
  });
});

// ===== 404 兜底 =====
app.use((req, res) => {
  res.status(404).json({ code: 404, message: `接口不存在: ${req.method} ${req.path}` });
});

// ===== 启动服务器 =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ LightPublish 后端启动成功！`);
  console.log(`🌐 地址：http://localhost:${PORT}`);
  console.log(`📋 接口列表：http://localhost:${PORT}/`);
});
