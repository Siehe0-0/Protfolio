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
    
    // 查询所有评论（包括回复）
    const [comments] = await db.query(
      `SELECT id, article_id as articleId, parent_id as parentId, content, author, likes, created_at as createdAt
       FROM comments 
       WHERE article_id = ? 
       ORDER BY created_at ASC`,
      [articleId]
    );
    
    // 将评论组织成树形结构
    const commentTree = [];
    const commentMap = new Map();
    
    // 先建立索引
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // 组织父子关系
    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      if (comment.parentId) {
        // 这是回复评论，找到父评论
        const parentComment = commentMap.get(comment.parentId);
        if (parentComment) {
          parentComment.replies.push(commentNode);
        }
      } else {
        // 这是顶级评论
        commentTree.push(commentNode);
      }
    });
    
    res.json({ 
      code: 200, 
      message: '获取评论成功',
      data: commentTree 
    });
    
  } catch (error) {
    console.error('获取评论失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// 发表评论
router.post('/', async (req, res) => {
  try {
    const { articleId, content, author = '匿名用户', parentId = null } = req.body;
    
    if (!articleId || !content) {
      return res.json({ code: 400, message: '缺少必要参数' });
    }
    
    // 如果是回复，验证父评论是否存在
    if (parentId) {
      const [parentComments] = await db.query(
        'SELECT id FROM comments WHERE id = ? AND article_id = ?',
        [parentId, articleId]
      );
      
      if (parentComments.length === 0) {
        return res.json({ code: 400, message: '父评论不存在' });
      }
    }
    
    const [result] = await db.query(
      `INSERT INTO comments (article_id, parent_id, content, author) 
       VALUES (?, ?, ?, ?)`,
      [articleId, parentId, content, author]
    );
    
    // 只有顶级评论才更新文章的评论数
    if (!parentId) {
      await db.query(
        `UPDATE articles 
         SET comment_count = comment_count + 1 
         WHERE id = ?`,
        [articleId]
      );
    }
    
    res.json({ 
      code: 200, 
      message: parentId ? '回复成功' : '评论发表成功',
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