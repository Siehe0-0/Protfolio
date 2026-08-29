const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/users/:id - 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT id, username as name, email, phone, avatar, bio, location, website, created_at as joinDate
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.json({ code: 404, message: '用户不存在' });
    }

    res.json({ code: 200, message: '获取用户信息成功', data: users[0] });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// PUT /api/users/:id - 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, location, website, avatar } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined)     { updates.push('username = ?');  params.push(name); }
    if (email !== undefined)    { updates.push('email = ?');     params.push(email); }
    if (bio !== undefined)      { updates.push('bio = ?');       params.push(bio); }
    if (location !== undefined) { updates.push('location = ?');  params.push(location); }
    if (website !== undefined)  { updates.push('website = ?');   params.push(website); }
    if (avatar !== undefined)   { updates.push('avatar = ?');    params.push(avatar); }

    if (updates.length === 0) {
      return res.json({ code: 400, message: '没有要更新的字段' });
    }

    params.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ code: 200, message: '用户信息更新成功' });

  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.json({ code: 500, message: '更新用户信息失败' });
  }
});

// GET /api/users/:id/stats - 用户统计数据
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `SELECT
         COUNT(DISTINCT a.id) as totalArticles,
         COALESCE(SUM(a.views), 0) as totalViews,
         COALESCE(SUM(a.likes), 0) as totalLikes,
         COALESCE(SUM(a.comment_count), 0) as totalComments,
         COALESCE(AVG(NULLIF(a.reading_time, 0)), 0) as avgReadingTime
       FROM users u
       LEFT JOIN articles a ON u.id = a.user_id
       WHERE u.id = ?`,
      [id]
    );

    const stats = result[0];
    res.json({
      code: 200,
      message: '获取统计数据成功',
      data: {
        totalArticles: stats.totalArticles || 0,
        totalViews: stats.totalViews || 0,
        totalLikes: stats.totalLikes || 0,
        totalComments: stats.totalComments || 0,
        avgReadingTime: Math.round(stats.avgReadingTime || 0),
        trend: 'up'
      }
    });

  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/users/:id/articles - 用户文章列表
router.get('/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereSQL = 'WHERE a.user_id = ?';
    const params = [id];

    if (status) {
      whereSQL += ' AND a.status = ?';
      params.push(status);
    }

    const [articles] = await db.query(
      `SELECT id, title, summary, tags, status, views, likes, comment_count,
              created_at as publishTime, updated_at as updateTime
       FROM articles a
       ${whereSQL}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const formattedArticles = articles.map(a => ({
      ...a,
      tags: (() => {
        try { return JSON.parse(a.tags || '[]'); }
        catch { return (a.tags || '').split(',').map(t => t.trim()).filter(Boolean); }
      })()
    }));

    res.json({ code: 200, message: '获取文章列表成功', data: formattedArticles });

  } catch (error) {
    console.error('获取用户文章失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/users/:id/activities - 用户活动记录
router.get('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    let activities = [];

    try {
      const [rows] = await db.query(
        `SELECT id, type, content as text, created_at as time
         FROM user_activities
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [id, parseInt(limit)]
      );
      activities = rows;
    } catch (e) {
      // user_activities 表不存在，降级：用文章动态代替
      const [articles] = await db.query(
        `SELECT id, title, status, created_at, updated_at
         FROM articles WHERE user_id = ?
         ORDER BY updated_at DESC LIMIT ?`,
        [id, parseInt(limit)]
      );
      activities = articles.map(a => ({
        id: a.id,
        type: a.status === 'published' ? 'publish' : 'edit',
        text: a.status === 'published'
          ? `发布了文章《${a.title}》`
          : `编辑了草稿《${a.title}》`,
        time: a.updated_at
      }));
    }

    res.json({ code: 200, message: '获取活动记录成功', data: activities });

  } catch (error) {
    console.error('获取活动记录失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/users/:id/chart - 文章发布趋势图表
router.get('/:id/chart', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query;

    let daysCount = 30;
    if (period === 'week') daysCount = 7;
    else if (period === 'year') daysCount = 12;

    let rows = [];

    if (period === 'year') {
      [rows] = await db.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m') as dateKey, COUNT(*) as count
         FROM articles
         WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY dateKey
         ORDER BY dateKey ASC`,
        [id]
      );
    } else {
      [rows] = await db.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as dateKey, COUNT(*) as count
         FROM articles
         WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY dateKey
         ORDER BY dateKey ASC`,
        [id, daysCount]
      );
    }

    const dateMap = {};
    rows.forEach(r => { dateMap[r.dateKey] = r.count; });

    const values = [];
    const labels = [];
    const now = new Date();

    if (period === 'year') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.push(`${d.getMonth() + 1}月`);
        values.push(dateMap[key] || 0);
      }
    } else {
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
        values.push(dateMap[key] || 0);
      }
    }

    res.json({
      code: 200,
      message: '获取图表数据成功',
      data: { values, labels }
    });

  } catch (error) {
    console.error('获取图表数据失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/users/:id/history - 阅读历史
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    let history = [];

    try {
      const [rows] = await db.query(
        `SELECT rh.id, rh.article_id as articleId, a.title as articleTitle, rh.created_at as viewTime
         FROM reading_history rh
         LEFT JOIN articles a ON rh.article_id = a.id
         WHERE rh.user_id = ?
         ORDER BY rh.created_at DESC
         LIMIT ?`,
        [id, parseInt(limit)]
      );
      history = rows;
    } catch (e) {
      history = [];
    }

    res.json({ code: 200, message: '获取阅读历史成功', data: history });

  } catch (error) {
    console.error('获取阅读历史失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
