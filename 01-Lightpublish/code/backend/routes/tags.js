const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/tags/hot - 热门标签
router.get('/hot', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [articles] = await db.query(
      `SELECT tags FROM articles WHERE status = 'published' AND tags IS NOT NULL AND tags != ''`
    );

    const tagCount = {};
    articles.forEach(article => {
      let tags = [];
      try {
        tags = JSON.parse(article.tags);
        if (!Array.isArray(tags)) tags = [tags];
      } catch {
        tags = article.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      tags.forEach(tag => {
        if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const hotTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([name, count]) => ({ name, count }));

    res.json({ code: 200, message: '获取热门标签成功', data: hotTags });

  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

// GET /api/tags - 所有标签（含文章数量）
router.get('/', async (req, res) => {
  try {
    const [articles] = await db.query(
      `SELECT tags FROM articles WHERE tags IS NOT NULL AND tags != ''`
    );

    const tagCount = {};
    articles.forEach(article => {
      let tags = [];
      try {
        tags = JSON.parse(article.tags);
        if (!Array.isArray(tags)) tags = [tags];
      } catch {
        tags = article.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      tags.forEach(tag => {
        if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const allTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    res.json({ code: 200, message: '获取标签成功', data: allTags });

  } catch (error) {
    console.error('获取标签失败:', error);
    res.json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
