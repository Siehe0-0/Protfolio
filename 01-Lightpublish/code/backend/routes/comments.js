const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 获取文章评论
router.get('/', async (req, res) => {
  try {
    const { articleId } = req.query;
    
    if (!articleId) {
      return res.json({ code: 400, message: '缺少文章ID' });
    }
    
    const [comments] = await db.query(
      `SELECT id, content, author, likes, created_at as createdAt
       FROM comments 
       WHERE article_id = ? 
       ORDER BY created_at DESC`,
      [articleId]
    );
    
    res.json({ 
      code: 200, 
      message: '获取评论成功',
      data: comments 
    });
    
  } catch (error) {
    console.error('获取评论失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 发表评论
router.post('/', async (req, res) => {
  try {
    const { articleId, content, author = '匿名用户' } = req.body;
    
    if (!articleId || !content) {
      return res.json({ code: 400, message: '缺少必要参数' });
    }
    
    const [result] = await db.query(
      `INSERT INTO comments (article_id, content, author) 
       VALUES (?, ?, ?)`,
      [articleId, content, author]
    );
    
    // 更新文章的评论数
    await db.query(
      `UPDATE articles 
       SET comment_count = comment_count + 1 
       WHERE id = ?`,
      [articleId]
    );
    
    res.json({ 
      code: 200, 
      message: '评论发表成功',
      data: { id: result.insertId }
    });
    
  } catch (error) {
    console.error('发表评论失败:', error);
    res.json({ code: 500, message: '发表评论失败' });
  }
});

// 点赞评论
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query(
      `UPDATE comments 
       SET likes = likes + 1 
       WHERE id = ?`,
      [id]
    );
    
    res.json({ 
      code: 200, 
      message: '点赞成功'
    });
    
  } catch (error) {
    console.error('点赞失败:', error);
    res.json({ code: 500, message: '点赞失败' });
  }
});

module.exports = router;