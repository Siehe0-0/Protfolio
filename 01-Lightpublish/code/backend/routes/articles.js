const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 解析 tags 字段（支持 JSON 数组 和 逗号分隔字符串）
const parseTags = (tagsRaw) => {
  if (!tagsRaw) return [];
  try {
    const parsed = JSON.parse(tagsRaw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  }
};

// GET /api/articles - 文章列表（支持分页、搜索、筛选）
router.get('/', async (req, res) => {
  try {
    const { limit = 20, page = 1, sort = 'newest', status, userId, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClauses = [];
    const params = [];

    if (status) {
      whereClauses.push('a.status = ?');
      params.push(status);
    }
    if (userId) {
      whereClauses.push('a.user_id = ?');
      params.push(userId);
    }
    if (search) {
      whereClauses.push('(a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const orderSQL = sort === 'oldest' ? 'a.created_at ASC'
      : sort === 'views' ? 'a.views DESC'
      : sort === 'likes' ? 'a.likes DESC'
      : 'a.created_at DESC';

    const [articles] = await db.query(
      `SELECT a.id, a.title, a.summary, a.tags, a.status, a.views, a.likes, a.comment_count,
              a.created_at as publishTime, a.updated_at as updateTime,
              u.username as author, u.id as authorId
       FROM articles a
       LEFT JOIN users u ON a.user_id = u.id
       ${whereSQL}
       ORDER BY ${orderSQL}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM articles a ${whereSQL}`,
      params
    );

    const formattedArticles = articles.map(a => ({
      ...a,
      tags: parseTags(a.tags)
    }));

    res.json({
      code: 200,
      message: '获取文章列表成功',
      data: formattedArticles,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/articles/:id - 文章详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [articles] = await db.query(
      `SELECT a.*, u.username as author, u.id as authorId, u.avatar as authorAvatar
       FROM articles a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (articles.length === 0) {
      return res.json({ code: 404, message: '文章不存在' });
    }

    const article = articles[0];

    // 自动增加浏览量
    await db.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);

    res.json({
      code: 200,
      message: '获取文章详情成功',
      data: {
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        author: article.author,
        authorId: article.authorId,
        authorAvatar: article.authorAvatar,
        tags: parseTags(article.tags),
        status: article.status,
        publishTime: article.created_at,
        updateTime: article.updated_at,
        views: (article.views || 0) + 1,
        likes: article.likes || 0,
        commentCount: article.comment_count || 0
      }
    });

  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// POST /api/articles - 创建文章
router.post('/', async (req, res) => {
  try {
    const { title, content, summary, tags = [], status = 'draft', userId } = req.body;

    if (!title || !content) {
      return res.json({ code: 400, message: '标题和内容不能为空' });
    }

    const tagsJSON = JSON.stringify(Array.isArray(tags) ? tags : []);
    const wordCount = content.replace(/\s+/g, '').length;
    const readingTime = Math.ceil(wordCount / 300);

    const [result] = await db.query(
      `INSERT INTO articles (title, content, summary, tags, status, user_id, views, likes, comment_count, reading_time, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?, NOW(), NOW())`,
      [title, content, summary || '', tagsJSON, status, userId || null, readingTime]
    );

    res.json({
      code: 200,
      message: '文章创建成功',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('创建文章失败:', error);
    res.json({ code: 500, message: '创建文章失败' });
  }
});

// PUT /api/articles/:id - 更新文章
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, tags, status } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (content !== undefined) {
      updates.push('content = ?'); params.push(content);
      const wordCount = content.replace(/\s+/g, '').length;
      updates.push('reading_time = ?'); params.push(Math.ceil(wordCount / 300));
    }
    if (summary !== undefined) { updates.push('summary = ?'); params.push(summary); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(Array.isArray(tags) ? tags : [])); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) {
      return res.json({ code: 400, message: '没有要更新的字段' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await db.query(
      `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ code: 200, message: '文章更新成功' });

  } catch (error) {
    console.error('更新文章失败:', error);
    res.json({ code: 500, message: '更新文章失败' });
  }
});

// DELETE /api/articles/:id - 删除文章
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM comments WHERE article_id = ?', [id]);
    await db.query('DELETE FROM articles WHERE id = ?', [id]);

    res.json({ code: 200, message: '文章删除成功' });

  } catch (error) {
    console.error('删除文章失败:', error);
    res.json({ code: 500, message: '删除文章失败' });
  }
});

// POST /api/articles/:id/like - 点赞文章
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('UPDATE articles SET likes = likes + 1 WHERE id = ?', [id]);
    const [result] = await db.query('SELECT likes FROM articles WHERE id = ?', [id]);

    res.json({
      code: 200,
      message: '点赞成功',
      data: { likes: result[0]?.likes || 0 }
    });

  } catch (error) {
    console.error('点赞失败:', error);
    res.json({ code: 500, message: '点赞失败' });
  }
});

module.exports = router;
