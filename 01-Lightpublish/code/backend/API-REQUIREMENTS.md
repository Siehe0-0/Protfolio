# 后端 API 接口需求清单

## 📋 概述

本文档列出了前端已对接的所有 API 接口，后端需要实现这些接口才能使应用正常运行。

---

## 🔐 1. 认证相关

### 1.1 用户注册
```
POST /api/auth/register
Body: { username, email, password }
Response: { code: 200, message: '注册成功', data: { user, token } }
```

### 1.2 用户登录
```
POST /api/auth/login
Body: { email, password }
Response: { code: 200, message: '登录成功', data: { user, token } }
```

---

## 👤 2. 用户相关

### 2.1 获取用户信息
```
GET /api/users/:id
Response: { 
  code: 200, 
  data: { 
    id, username, email, avatar, bio, location, website, 
    created_at, is_verified 
  } 
}
```

### 2.2 更新用户信息
```
PUT /api/users/:id
Body: { username, bio, location, website, avatar }
Response: { code: 200, message: '更新成功' }
```

### 2.3 获取用户统计数据
```
GET /api/users/:id/stats
Response: {
  code: 200,
  data: {
    totalArticles: 42,
    totalViews: 15234,
    totalLikes: 1289,
    totalComments: 567,
    avgReadingTime: 3
  }
}
```

### 2.4 获取用户文章列表
```
GET /api/users/:id/articles?limit=5&status=published
Response: {
  code: 200,
  data: [
    { id, title, summary, status, views, likes, comment_count, created_at }
  ]
}
```

### 2.5 获取用户活动记录
```
GET /api/users/:id/activities?limit=10
Response: {
  code: 200,
  data: [
    { 
      id, 
      activity_type, 
      article_id, 
      details, 
      created_at 
    }
  ]
}
```

### 2.6 获取用户图表数据
```
GET /api/users/:id/chart?period=week|month|year
Response: {
  code: 200,
  data: {
    labels: ['周一', '周二', ...],
    values: [12, 19, 8, ...]
  }
}
```

### 2.7 获取阅读历史
```
GET /api/users/:id/history
Response: {
  code: 200,
  data: [
    { 
      id, 
      article_id, 
      article_title, 
      read_at, 
      read_duration 
    }
  ]
}
```

---

## 📝 3. 文章相关

### 3.1 获取文章列表
```
GET /api/articles?limit=10&sort=newest&page=1
Response: {
  code: 200,
  data: [
    {
      id, title, summary, cover_image, tags, status,
      views, likes, comment_count, created_at, published_at
    }
  ]
}
```

### 3.2 获取文章详情
```
GET /api/articles/:id
Response: {
  code: 200,
  data: {
    id, user_id, title, content, summary, cover_image,
    tags, status, views, likes, comment_count,
    word_count, reading_time, created_at, published_at,
    author: { username, avatar }
  }
}
```

### 3.3 创建文章
```
POST /api/articles
Body: { 
  user_id, title, content, summary, cover_image, 
  tags, status 
}
Response: { code: 200, message: '创建成功', data: { id } }
```

### 3.4 更新文章
```
PUT /api/articles/:id
Body: { title, content, summary, tags, status }
Response: { code: 200, message: '更新成功' }
```

### 3.5 删除文章
```
DELETE /api/articles/:id
Response: { code: 200, message: '删除成功' }
```

### 3.6 点赞文章
```
POST /api/articles/:id/like
Body: { user_id }
Response: { code: 200, message: '点赞成功' }
```

---

## 💬 4. 评论相关

### 4.1 获取文章评论
```
GET /api/comments?articleId=1
Response: {
  code: 200,
  data: [
    {
      id, article_id, user_id, parent_id,
      content, author, likes, created_at,
      replies: [
        { id, parent_id, content, author, likes, created_at }
      ]
    }
  ]
}
```

### 4.2 发表评论/回复
```
POST /api/comments
Body: { article_id, user_id, content, parent_id (可选) }
Response: { code: 200, message: '评论成功', data: { id } }
```

### 4.3 点赞评论
```
POST /api/comments/:id/like
Body: { user_id }
Response: { code: 200, message: '点赞成功' }
```

### 4.4 删除评论
```
DELETE /api/comments/:id
Response: { code: 200, message: '删除成功' }
```

---

## 🏷️ 5. 标签相关

### 5.1 获取热门标签
```
GET /api/tags/hot?limit=10
Response: {
  code: 200,
  data: ['Vue', 'React', 'JavaScript', ...]
}
```

### 5.2 获取所有标签
```
GET /api/tags
Response: {
  code: 200,
  data: [
    { name, count }
  ]
}
```

---

## 📊 6. 统计相关

### 6.1 获取全站统计
```
GET /api/stats
Response: {
  code: 200,
  data: {
    totalUsers,
    totalArticles,
    totalComments,
    totalViews
  }
}
```

---

## 🔧 实现建议

### 1. 路由文件组织
```
backend/
├── routes/
│   ├── auth.js          # 认证相关
│   ├── users.js         # 用户相关
│   ├── articles.js      # 文章相关
│   ├── comments.js      # 评论相关（已部分实现）
│   └── tags.js          # 标签相关
```

### 2. 控制器组织
```
backend/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── articleController.js
│   ├── commentController.js
│   └── tagController.js
```

### 3. 中间件
```
backend/
├── middleware/
│   ├── auth.js          # 认证中间件
│   └── validation.js    # 数据验证
```

---

## ✅ 已实现的接口

- [x] GET /api/comments?articleId=:id （部分实现，需要支持树形结构）
- [x] POST /api/comments （需要支持 parent_id）
- [x] POST /api/comments/:id/like

---

## 🚀 优先级建议

### P0 - 必须实现（核心功能）
1. 用户注册/登录
2. 文章 CRUD
3. 评论系统（含回复）
4. 用户信息获取

### P1 - 重要功能
5. 文章点赞
6. 评论点赞
7. 用户统计
8. 阅读历史

### P2 - 增强功能
9. 活动记录
10. 图表数据
11. 标签系统
12. 文件上传

---

## 📝 响应格式规范

所有 API 响应统一使用以下格式：

```javascript
// 成功响应
{
  code: 200,
  message: '操作成功',
  data: { ... }
}

// 错误响应
{
  code: 400,  // 400/401/403/404/500
  message: '错误信息',
  data: null
}
```

---

## 🔐 认证机制

使用 JWT Token 认证：

1. 登录/注册后返回 token
2. 前端存储 token 在 localStorage
3. 需要认证的接口在 Header 中携带 token：
   ```
   Authorization: Bearer <token>
   ```

---

## 💡 开发提示

1. **使用参数化查询**防止 SQL 注入
2. **密码必须 bcrypt 哈希**存储
3. **添加请求验证**中间件
4. **记录操作日志**到 user_activities 表
5. **分页查询**使用 LIMIT 和 OFFSET
6. **错误处理**统一返回标准格式

---

## 📚 参考文档

- 数据库设计：`DATABASE-DESIGN.md`
- 数据库初始化：`INIT-DATABASE.md`
- 表结构：`complete-database-schema.sql`
