<template>
  <div class="ehome">
    <!-- 简约顶部导航 -->
    <header class="ehome-header">
      <div class="header-container">
        <!-- 左侧Logo和名称 -->
        <div class="header-left">
          <div class="logo">
            <span>📚</span>
            <h1>LightRead</h1>
          </div>
        </div>
        
        <!-- 右侧搜索和登录 -->
        <div class="header-right">
          <!-- 搜索框 -->
          <div class="search-container">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="搜索文章..."
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="search-btn">🔍</button>
          </div>
          
          <!-- 登录按钮 -->
          <RouterLink 
            v-if="!isLoggedIn"
            to="/login" 
            class="login-btn"
          >
            登录
          </RouterLink>
          <RouterLink 
            v-else
            to="/home" 
            class="user-btn"
          >
            👤 我的主页
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="ehome-main">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h2 class="hero-title">发现优质技术文章</h2>
          <p class="hero-subtitle">编程 · 设计 · 思考 · 分享</p>
          
          <!-- 大搜索框 -->
          <div class="hero-search">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="输入关键词，发现精彩内容..."
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="hero-search-btn">
              搜索
            </button>
          </div>
        </div>
      </section>

      <!-- 文章列表 -->
      <section class="articles-section">
        <div class="section-container">
          <div class="section-header">
            <h3>最新文章</h3>
            <RouterLink to="/articles" class="view-all">查看全部 →</RouterLink>
          </div>
          
          <div class="articles-grid">
            <div 
              v-for="article in articles" 
              :key="article.id"
              class="article-card"
              @click="viewArticle(article.id)"
            >
              <div class="article-header">
                <h4>{{ article.title }}</h4>
                <span class="read-count">👁️ {{ article.reads }}</span>
              </div>
              <p class="article-excerpt">{{ article.excerpt }}</p>
              <div class="article-footer">
                <span class="author">👤 {{ article.author }}</span>
                <span class="date">{{ formatDate(article.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门标签 -->
      <section class="tags-section">
        <div class="section-container">
          <h3>热门标签</h3>
          <div class="tags-container">
            <span 
              v-for="tag in hotTags" 
              :key="tag"
              class="tag"
              @click="searchByTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部 -->
    <footer class="ehome-footer">
      <p>© 2024 LightRead · 专注于技术分享</p>
      <p class="footer-links">
        <a href="#">关于</a> · 
        <a href="#">联系</a> · 
        <a href="#">隐私</a> · 
        <a href="#">条款</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

// 检查登录状态
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

// 文章数据
const articles = ref([
  {
    id: 1,
    title: 'Vue 3 Composition API 完全指南',
    excerpt: '详细介绍 Vue 3 的 Composition API 使用方法和最佳实践',
    author: '张明',
    date: '2024-01-15',
    reads: 1245,
    tags: ['Vue', '前端', 'JavaScript']
  },
  {
    id: 2,
    title: 'TypeScript 类型体操入门',
    excerpt: '学习 TypeScript 高级类型和类型编程的基础知识',
    author: '李华',
    date: '2024-01-12',
    reads: 892,
    tags: ['TypeScript', '编程']
  },
  {
    id: 3,
    title: 'Node.js 性能优化实战',
    excerpt: '通过实际案例讲解 Node.js 应用的性能优化技巧',
    author: '王强',
    date: '2024-01-10',
    reads: 756,
    tags: ['Node.js', '后端', '性能']
  },
  {
    id: 4,
    title: '现代 CSS 布局完全指南',
    excerpt: 'Flexbox、Grid 和现代 CSS 布局技术的全面解析',
    author: '赵敏',
    date: '2024-01-08',
    reads: 543,
    tags: ['CSS', '前端', '设计']
  },
  {
    id: 5,
    title: '现代 CSS 布局完全指南',
    excerpt: 'Flexbox、Grid 和现代 CSS 布局技术的全面解析',
    author: '赵敏',
    date: '2024-01-08',
    reads: 543,
    tags: ['CSS', '前端', '设计']
  }
])

// 热门标签
const hotTags = ref([
  'Vue', 'React', 'JavaScript', 'TypeScript', 'Node.js',
  'CSS', '算法', '数据库', '架构', 'DevOps'
])

// 搜索功能
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/articles',
      query: { q: searchQuery.value }
    })
  }
}

// 按标签搜索
const searchByTag = (tag) => {
  router.push({
    path: '/articles',
    query: { tag }
  })
}

// 查看文章
const viewArticle = (id) => {
  router.push(`/article/${id}`)
}

// 格式化日期
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  // 可以在这里加载真实数据
})
</script>

<style scoped>
/* ehome 基础样式 */
.ehome {
  width: 100%;
  min-height: 100vh;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: #fafafa;
}

/* 顶部导航 */
.ehome-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo span {
  font-size: 24px;
}

.logo h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.main-nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #1890ff;
}

/* 右侧区域 */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 6px 12px;
}

.search-container input {
  border: none;
  background: transparent;
  padding: 4px 8px;
  width: 180px;
  outline: none;
}

.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.login-btn,
.user-btn {
  padding: 8px 20px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.login-btn {
  background: #1890ff;
  color: white;
}

.user-btn {
  background: #f0f0f0;
  color: #333;
}

.login-btn:hover,
.user-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 主内容区 */
.ehome-main {
  flex: 1;
}
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.hero-search {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  gap: 10px;
}

.hero-search input {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.hero-search-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 0 32px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.hero-search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

/* 文章区域 */
.articles-section {
  padding: 60px 20px;
  background: #fafafa;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.section-header h3 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.view-all {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.article-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.article-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.read-count {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 10px;
}

.article-excerpt {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.author,
.date {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 标签区域 */
.tags-section {
  padding: 40px 20px;
  background: white;
}

.tags-section h3 {
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
}

.tag {
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tag:hover {
  background: #1890ff;
  color: white;
  transform: translateY(-2px);
}

/* 底部 */
.ehome-footer {
  background: #333;
  color: #999;
  padding: 30px 20px;
  text-align: center;
  margin-top: auto;
}

.ehome-footer p {
  margin: 8px 0;
}

.footer-links a {
  color: #999;
  text-decoration: none;
  margin: 0 10px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    height: auto;
    padding: 15px 0;
  }
  
  .header-left {
    width: 100%;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-search {
    flex-direction: column;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>