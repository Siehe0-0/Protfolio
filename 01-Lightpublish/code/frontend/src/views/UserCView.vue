<template>
  <div class="user-center-page">
    <!-- 用户信息卡片 -->
    <div class="user-profile">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img 
              v-if="userInfo.avatar" 
              :src="userInfo.avatar" 
              alt="头像"
              class="avatar"
            />
            <div v-else class="avatar-placeholder">
              {{ userInfo.name?.charAt(0) || 'U' }}
            </div>
            <button @click="changeAvatar" class="avatar-upload-btn" title="更换头像">
              <span>✎</span>
            </button>
          </div>
          <div class="avatar-actions">
            <button @click="changeAvatar" class="btn btn-outline">
              <span class="icon">🖼️</span>
              更换头像
            </button>
          </div>
        </div>
        
        <div class="profile-info">
          <div class="user-main">
            <h1 class="username">{{ userInfo.name }}</h1>
            <p class="user-bio">{{ userInfo.bio || '这个人很懒，还没有写简介~' }}</p>
            <div class="user-meta">
              <span class="meta-item">
                <span class="icon">📧</span>
                {{ userInfo.email }}
              </span>
              <span class="meta-item" v-if="userInfo.location">
                <span class="icon">📍</span>
                {{ userInfo.location }}
              </span>
              <span class="meta-item">
                <span class="icon">📅</span>
                加入于 {{ formatDate(userInfo.joinDate) }}
              </span>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalArticles }}</div>
              <div class="stat-label">文章数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalViews }}</div>
              <div class="stat-label">阅读量</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalLikes }}</div>
              <div class="stat-label">获赞数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalComments }}</div>
              <div class="stat-label">评论数</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-actions">
        <button @click="editProfile" class="btn btn-primary">
          <span class="icon">✎</span>
          编辑资料
        </button>
        <button @click="logout" class="btn btn-outline">
          <span class="icon">🚪</span>
          退出登录
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：文章管理 -->
      <div class="content-left">
        <!-- 快速操作 -->
        <div class="quick-actions">
          <h2 class="section-title">快速操作</h2>
          <div class="action-grid">
            <button @click="goToCreateArticle" class="action-card">
              <div class="action-icon">✍️</div>
              <div class="action-title">写新文章</div>
              <div class="action-desc">开始创作新的内容</div>
            </button>
            <button @click="goToDrafts" class="action-card">
              <div class="action-icon">📄</div>
              <div class="action-title">草稿箱</div>
              <div class="action-desc">继续未完成的文章</div>
            </button>
            <button @click="goToComments" class="action-card">
              <div class="action-icon">💬</div>
              <div class="action-title">评论管理</div>
              <div class="action-desc">查看和管理评论</div>
            </button>
            <button @click="goToSettings" class="action-card">
              <div class="action-icon">⚙️</div>
              <div class="action-title">账户设置</div>
              <div class="action-desc">修改密码和偏好</div>
            </button>
          </div>
        </div>

        <!-- 最近文章 -->
        <div class="recent-articles">
          <div class="section-header">
            <h2 class="section-title">最近文章</h2>
            <button @click="goToArticles" class="btn btn-link">
              查看全部 →
            </button>
          </div>
          
          <div class="articles-list">
            <div 
              v-for="article in recentArticles" 
              :key="article.id"
              class="article-item"
            >
              <div class="article-main">
                <h3 class="article-title">
                  <router-link :to="`/article/${article.id}`">
                    {{ article.title }}
                  </router-link>
                </h3>
                <p class="article-summary">{{ article.summary }}</p>
                <div class="article-meta">
                  <span class="meta-item">
                    <span class="icon">📅</span>
                    {{ formatDate(article.publishTime) }}
                  </span>
                  <span class="meta-item">
                    <span class="icon">👁️</span>
                    {{ article.views }} 阅读
                  </span>
                  <span class="meta-item">
                    <span class="icon">❤️</span>
                    {{ article.likes }} 喜欢
                  </span>
                  <span class="meta-item">
                    <span class="badge" :class="article.status">
                      {{ getStatusText(article.status) }}
                    </span>
                  </span>
                </div>
              </div>
              <div class="article-actions">
                <button @click="editArticle(article.id)" class="btn-icon" title="编辑">
                  ✎
                </button>
                <button @click="deleteArticle(article.id)" class="btn-icon btn-danger" title="删除">
                  🗑️
                </button>
              </div>
            </div>
            
            <div v-if="recentArticles.length === 0" class="empty-articles">
              <div class="empty-icon">📝</div>
              <p>还没有发布过文章</p>
              <button @click="goToCreateArticle" class="btn btn-primary">
                开始写作
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：统计信息和活动 -->
      <div class="content-right">
        <!-- 写作统计 -->
        <div class="writing-stats">
          <h2 class="section-title">写作统计</h2>
          <div class="stats-cards">
            <div class="stats-card">
              <div class="stats-header">
                <div class="stats-icon">📈</div>
                <div class="stats-trend" :class="stats.trend">
                  {{ stats.trend === 'up' ? '↑' : '↓' }} 12%
                </div>
              </div>
              <div class="stats-content">
                <div class="stats-value">15,234</div>
                <div class="stats-label">本月阅读量</div>
              </div>
            </div>
            <div class="stats-card">
              <div class="stats-header">
                <div class="stats-icon">⏱️</div>
                <div class="stats-trend" :class="stats.trend">
                  {{ stats.trend === 'up' ? '↑' : '↓' }} 8%
                </div>
              </div>
              <div class="stats-content">
                <div class="stats-value">{{ stats.avgReadingTime }}分钟</div>
                <div class="stats-label">平均阅读时长</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据图表 -->
        <div class="data-charts">
          <div class="chart-header">
            <h3 class="chart-title">文章发布趋势</h3>
            <select v-model="chartPeriod" class="period-select">
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="year">今年</option>
            </select>
          </div>
          <div class="chart-container">
            <!-- 这里可以集成图表库，先使用模拟图表 -->
            <div class="mock-chart">
              <div class="chart-bars">
                <div 
                  v-for="(value, index) in chartData" 
                  :key="index"
                  class="chart-bar"
                  :style="{ height: value * 2 + 'px' }"
                  :title="'数量: ' + value"
                ></div>
              </div>
              <div class="chart-labels">
                <span v-for="label in chartLabels" :key="label">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 活动记录 -->
        <div class="activity-log">
          <h2 class="section-title">最近活动</h2>
          <div class="activities">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                {{ getActivityIcon(activity.type) }}
              </div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.text }}</div>
                <div class="activity-time">{{ formatTime(activity.time) }}</div>
              </div>
            </div>
            
            <div v-if="recentActivities.length === 0" class="empty-activities">
              <p>暂无活动记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>编辑资料</h3>
          <button @click="closeEditModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProfile" class="edit-form">
            <div class="form-group">
              <label for="name">用户名</label>
              <input
                v-model="editForm.name"
                type="text"
                id="name"
                placeholder="请输入用户名"
                required
              />
            </div>
            <div class="form-group">
              <label for="email">邮箱</label>
              <input
                v-model="editForm.email"
                type="email"
                id="email"
                placeholder="请输入邮箱"
                required
              />
            </div>
            <div class="form-group">
              <label for="bio">个人简介</label>
              <textarea
                v-model="editForm.bio"
                id="bio"
                placeholder="介绍一下自己吧~"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="location">所在地</label>
              <input
                v-model="editForm.location"
                type="text"
                id="location"
                placeholder="请输入所在地"
              />
            </div>
            <div class="form-group">
              <label for="website">个人网站</label>
              <input
                v-model="editForm.website"
                type="url"
                id="website"
                placeholder="https://"
              />
            </div>
            <div class="form-actions">
              <button type="button" @click="closeEditModal" class="btn btn-outline">
                取消
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? '保存中...' : '保存更改' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用户信息
const userInfo = ref({
  id: 1,
  name: 'LightPublish用户',
  email: 'user@lightpublish.com',
  avatar: '',
  bio: '热爱写作与分享的前端开发者',
  location: '上海',
  website: 'https://lightpublish.com',
  joinDate: '2024-01-01',
  isVerified: true
})

// 统计数据
const stats = reactive({
  totalArticles: 42,
  totalViews: 15234,
  totalLikes: 1289,
  totalComments: 567,
  avgReadingTime: 3,
  trend: 'up'
})

// 最近文章
const recentArticles = ref([
  {
    id: 1,
    title: 'Vue 3 Composition API 最佳实践',
    summary: '分享在实际项目中使用Vue 3 Composition API的经验和技巧...',
    publishTime: '2024-03-15',
    views: 1234,
    likes: 89,
    comments: 24,
    status: 'published'
  },
  {
    id: 2,
    title: 'TypeScript在大型项目中的应用',
    summary: '探讨如何在大型前端项目中有效使用TypeScript进行类型安全开发...',
    publishTime: '2024-03-10',
    views: 987,
    likes: 67,
    comments: 18,
    status: 'published'
  },
  {
    id: 3,
    title: '现代CSS布局方案对比',
    summary: '对比Flexbox、Grid等现代CSS布局方案的优缺点和适用场景...',
    publishTime: '2024-03-05',
    views: 765,
    likes: 45,
    comments: 12,
    status: 'draft'
  },
  {
    id: 4,
    title: 'Web性能优化实战指南',
    summary: '从理论到实践，全方位介绍Web性能优化的方法和工具...',
    publishTime: '2024-02-28',
    views: 2100,
    likes: 156,
    comments: 42,
    status: 'published'
  }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    type: 'publish',
    text: '发布了新文章《Vue 3 Composition API 最佳实践》',
    time: '2024-03-15 14:30:00'
  },
  {
    id: 2,
    type: 'comment',
    text: '在文章《TypeScript在大型项目中的应用》收到新评论',
    time: '2024-03-14 09:15:00'
  },
  {
    id: 3,
    type: 'like',
    text: '文章《现代CSS布局方案对比》获得10个新的赞',
    time: '2024-03-13 16:45:00'
  },
  {
    id: 4,
    type: 'edit',
    text: '修改了文章《Web性能优化实战指南》的内容',
    time: '2024-03-12 11:20:00'
  },
  {
    id: 5,
    type: 'follow',
    text: '有5位新用户关注了你',
    time: '2024-03-11 19:05:00'
  }
])

// 图表数据
const chartPeriod = ref('month')
const chartData = ref([12, 19, 8, 15, 10, 20, 14])
const chartLabels = ref(['一', '二', '三', '四', '五', '六', '日'])

// 编辑相关
const showEditModal = ref(false)
const saving = ref(false)
const editForm = reactive({
  name: '',
  email: '',
  bio: '',
  location: '',
  website: ''
})

// 计算属性
const articlesByStatus = computed(() => {
  const published = recentArticles.value.filter(a => a.status === 'published').length
  const draft = recentArticles.value.filter(a => a.status === 'draft').length
  return { published, draft }
})

// 生命周期
onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    // 这里可以添加API调用
    console.log('个人中心数据加载完成')
  }, 500)
})

// 方法
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  
  // 转换为分钟、小时、天
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return formatDate(timeString)
  }
}

const getStatusText = (status) => {
  const statusMap = {
    published: '已发布',
    draft: '草稿',
    scheduled: '定时发布',
    archived: '已归档'
  }
  return statusMap[status] || status
}

const getActivityIcon = (type) => {
  const iconMap = {
    publish: '📝',
    comment: '💬',
    like: '❤️',
    edit: '✎',
    follow: '👥',
    share: '🔗'
  }
  return iconMap[type] || '📌'
}

// 导航方法
const goToCreateArticle = () => {
  router.push('/create-article')
}

const goToDrafts = () => {
  router.push('/drafts')
}

const goToArticles = () => {
  router.push('/artlist')
}

const goToComments = () => {
  router.push('/comments')
}

const goToSettings = () => {
  router.push('/settings')
}

// 文章操作
const editArticle = (id) => {
  router.push(`/create-article?edit=${id}`)
}

const deleteArticle = (id) => {
  if (confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
    // 这里应该调用API删除文章
    recentArticles.value = recentArticles.value.filter(article => article.id !== id)
    stats.totalArticles--
    console.log(`删除文章 ${id}`)
  }
}

// 资料编辑
const editProfile = () => {
  // 填充当前数据到编辑表单
  editForm.name = userInfo.value.name
  editForm.email = userInfo.value.email
  editForm.bio = userInfo.value.bio
  editForm.location = userInfo.value.location
  editForm.website = userInfo.value.website
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveProfile = async () => {
  saving.value = true
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息
    userInfo.value.name = editForm.name
    userInfo.value.email = editForm.email
    userInfo.value.bio = editForm.bio
    userInfo.value.location = editForm.location
    userInfo.value.website = editForm.website
    
    // 显示成功消息
    alert('资料更新成功！')
    closeEditModal()
    
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const changeAvatar = () => {
  // 这里应该实现头像上传逻辑
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 这里应该上传文件到服务器
      const reader = new FileReader()
      reader.onload = (event) => {
        userInfo.value.avatar = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    // 这里应该清除登录状态
    router.push('/login')
  }
}
</script>

<style scoped>
.user-center-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 用户信息卡片 */
.user-profile {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #f8f9fa;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 60px;
  font-weight: bold;
  border: 5px solid #f8f9fa;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #667eea;
  font-size: 18px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-upload-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.avatar-actions {
  display: flex;
  gap: 10px;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.user-main .username {
  margin: 0 0 10px 0;
  font-size: 32px;
  color: #333;
}

.user-bio {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 16px;
  line-height: 1.6;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.meta-item .icon {
  font-size: 16px;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: auto;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-card:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.profile-actions {
  display: flex;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 主要内容区域 */
.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

/* 左侧区域 */
.content-left {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 快速操作 */
.quick-actions {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.action-card {
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  background: white;
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
}

.action-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.action-desc {
  font-size: 14px;
  color: #666;
}

/* 最近文章 */
.recent-articles {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: underline;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s;
}

.article-item:hover {
  background: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.article-main {
  flex: 1;
}

.article-title {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.article-title a {
  color: #333;
  text-decoration: none;
}

.article-title a:hover {
  color: #667eea;
}

.article-summary {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: #888;
}

.article-meta .icon {
  margin-right: 5px;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge.published {
  background: #d4edda;
  color: #155724;
}

.badge.draft {
  background: #fff3cd;
  color: #856404;
}

.badge.scheduled {
  background: #d1ecf1;
  color: #0c5460;
}

.article-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

.btn-icon.btn-danger:hover {
  background: #f8d7da;
  border-color: #dc3545;
  color: #dc3545;
}

.empty-articles {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-articles p {
  color: #999;
  margin-bottom: 20px;
}

/* 右侧区域 */
.content-right {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 写作统计 */
.writing-stats {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}

.stats-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 25px;
  color: white;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.stats-icon {
  font-size: 32px;
}

.stats-trend {
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
}

.stats-trend.up {
  color: #4cd964;
}

.stats-trend.down {
  color: #ff3b30;
}

.stats-content {
  position: relative;
  z-index: 1;
}

.stats-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 数据图表 */
.data-charts {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.period-select {
  padding: 8px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.period-select:focus {
  outline: none;
  border-color: #667eea;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.mock-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
  padding: 0 10px;
}

.chart-bar {
  width: 40px;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 10px 10px 0 10px;
  color: #666;
  font-size: 12px;
}

/* 活动记录 */
.activity-log {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
}

.activities {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.activity-icon.publish { background: #e3f2fd; color: #1976d2; }
.activity-icon.comment { background: #f3e5f5; color: #7b1fa2; }
.activity-icon.like { background: #ffebee; color: #d32f2f; }
.activity-icon.edit { background: #fff3e0; color: #f57c00; }
.activity-icon.follow { background: #e8f5e8; color: #388e3c; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 12px;
  color: #888;
}

.empty-activities {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.modal-close:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 30px;
}

/* 表单 */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 按钮样式 */
.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.icon {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .user-center-page {
    padding: 10px;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .article-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .article-actions {
    align-self: flex-end;
  }
  
  .modal-content {
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .user-profile {
    padding: 20px;
  }
  
  .avatar-wrapper {
    width: 120px;
    height: 120px;
  }
  
  .username {
    font-size: 24px;
  }
  
  .profile-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .section-title {
    font-size: 18px;
  }
}
</style>