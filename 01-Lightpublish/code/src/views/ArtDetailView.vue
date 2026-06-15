<template>
  <div class="article-detail-container">

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载文章...</p>
    </div>
    <div class="debug-actions" v-if="!loading && article">
  <button @click="testAllAPIs" class="debug-btn">
    🧪 测试所有API连接
  </button>
</div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>{{ error }}</h3>
      <button @click="retryLoad" class="retry-btn">
        重试
      </button>
    </div>

    <!-- 文章内容 -->
    <article 
      v-if="!loading && article" 
      class="article-content"
      @dblclick="handleDoubleClick"  <!-- 添加双击事件监听 -->
    >
      <!-- 文章标题区域 -->
      <div class="article-title-section">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="title-underline"></div>
      </div>

      <!-- 文章元信息 -->
      <div class="article-meta-info">
        <div class="author-info">
          <span class="author-avatar">👤</span>
          <span class="author-name">{{ article.author || '未知作者' }}</span>
          <span class="separator">•</span>
          <span class="publish-time">
            📅 {{ formatDate(article.publishTime) }}
          </span>
        </div>
        
        <div class="article-stats">
          <span class="stat-item">
            👁️ {{ article.views || 0 }} 浏览
          </span>
          <span class="stat-item">
            💬 {{ article.commentCount || 0 }} 评论
          </span>
          <span class="stat-item">
            ❤️ {{ article.likes || 0 }} 点赞
          </span>
        </div>
      </div>

      <!-- 文章标签 -->
      <div v-if="article.tags && article.tags.length > 0" class="article-tags">
        <span 
          v-for="tag in article.tags" 
          :key="tag"
          class="tag"
          @click="searchByTag(tag)"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- 文章摘要 -->
      <div v-if="article.summary" class="article-summary-card">
        <h3>📝 摘要</h3>
        <p>{{ article.summary }}</p>
      </div>

      <!-- 文章主体内容 -->
      <div class="article-body">
        <div class="content" v-html="renderContent(article.content)"></div>
      </div>

      <!-- 文章底部操作 -->
      <div class="article-footer">
        <div class="footer-actions">
          <button @click="likeArticle" class="action-btn like-btn">
            <span class="action-icon">❤️</span>
            <span>点赞</span>
            <span class="count">{{ article.likes || 0 }}</span>
          </button>
          
          <button @click="shareArticle" class="action-btn share-btn">
            <span class="action-icon">📤</span>
            <span>分享</span>
          </button>

            <!-- 新增评论按钮 -->
          <button @click="openCommentPanel" class="action-btn comment-btn">
            <span class="action-icon">💬</span>
            <span>评论</span>
            <span class="count">{{ commentCount || 0 }}</span>
          </button>
          
          <button @click="bookmarkArticle" class="action-btn bookmark-btn">
            <span class="action-icon">🔖</span>
            <span>收藏</span>
          </button>
        </div>
        
        <div v-if="article.updateTime" class="update-info">
          最后更新于：{{ formatDate(article.updateTime) }}
        </div>
      </div>
    </article>

 
  <!-- 评论弹窗 -->
    <div 
      v-if="showCommentPanel" 
      class="comment-panel"
      :style="panelStyle"
    >
      <!-- 弹窗头部 -->
      <div class="panel-header" @mousedown="startDrag">
        <div class="header-left">
          <h3>💬 评论</h3>
          <span class="comment-count">{{ commentCount || 0 }} 条评论</span>
        </div>
        <div class="header-right">
          <button class="header-btn" @click="minimizePanel">
            {{ isMinimized ? '📈' : '📉' }}
          </button>
          <button class="header-btn close-btn" @click="closeCommentPanel">
            ✕
          </button>
        </div>
      </div>

      <!-- 弹窗内容 -->
      <div v-if="!isMinimized" class="comment-content">
        <!-- 发表评论区域 -->
        <div class="comment-input-section" @mousedown.stop>
          <textarea 
            v-model="newComment"
            placeholder="写下你的评论..."
            class="comment-input"
            rows="3"
            @mousedown.stop
          ></textarea>
          <div class="input-actions">
            <button 
              @click="submitComment" 
              class="submit-btn"
              :disabled="!newComment.trim()"
            >
              发表评论
            </button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list" @mousedown.stop>
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-avatar">
              {{ comment.author?.charAt(0) || '👤' }}
            </div>
            <div class="comment-body">
              <div class="comment-item-header">
                <span class="comment-author">{{ comment.author || '匿名用户' }}</span>
                <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
              <div class="comment-actions">
                <button @click="likeComment(comment.id)" class="comment-action-btn">
                  ❤️ {{ comment.likes || 0 }}
                </button>
                <button @click="replyToComment(comment.id)" class="comment-action-btn">
                  回复
                </button>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-if="comments.length === 0" class="empty-comments">
            <div class="empty-icon">💬</div>
            <p>还没有评论，快来抢沙发吧！</p>
          </div>
        </div>
      </div>

      <!-- 调整大小的手柄 -->
      <div class="resize-handle" @mousedown="startResize"></div>
    </div>
    <!-- 笔记弹窗 -->
    <div 
      v-if="showNoteDialog" 
      class="note-dialog"
      :style="noteDialogStyle"
      @mousedown.stop
    >
      <div class="note-header">
        <h4>📝 添加笔记</h4>
        <button class="note-close-btn" @click="closeNoteDialog">✕</button>
      </div>
      <div class="note-content">
        <textarea 
          v-model="noteContent"
          placeholder="写下你的笔记..."
          class="note-input"
          rows="5"
        ></textarea>
        <div class="note-actions">
          <button @click="saveNote" class="save-btn">保存笔记</button>
          <button @click="closeNoteDialog" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const API_BASE_URL = 'http://localhost:3000/api'
const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(true)
const error = ref('')
const article = ref(null)


// 评论弹窗状态
const showCommentPanel = ref(false)
const isMinimized = ref(false)
const panelPosition = ref({ x: window.innerWidth - 420, y: 100 })
const panelSize = ref({ width: 400, height: 500 })
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const startSize = ref({ width: 0, height: 0 })

// 评论数据
const comments = ref([])
const newComment = ref('')
const commentCount = ref(0)

// 笔记功能
const showNoteDialog = ref(false)
const noteDialogPosition = ref({ x: 0, y: 0 })
const noteContent = ref('')

// 添加测试函数
const testAllAPIs = async () => {
  const articleId = route.params.id
  
  try {
    // 测试1: 文章API
    console.log('测试文章API...')
    const articleRes = await fetch(`${API_BASE_URL}/articles/${articleId}`)
    console.log('文章API:', articleRes.ok ? '✅ 正常' : '❌ 失败')
    
    // 测试2: 评论API
    console.log('测试评论API...')
    const commentsRes = await fetch(`${API_BASE_URL}/comments?articleId=${articleId}`)
    console.log('评论API:', commentsRes.ok ? '✅ 正常' : '❌ 失败')
    
    // 综合判断
    if (articleRes.ok && commentsRes.ok) {
      alert('🎉 所有API连接正常！')
    } else {
      alert('⚠️ 部分API连接失败，请检查控制台')
    }
    
  } catch (err) {
    console.error('API测试失败:', err)
    alert('❌ API连接测试失败')
  }
}

const panelStyle = computed(() => ({
  left: `${panelPosition.value.x}px`,
  top: `${panelPosition.value.y}px`,
  width: `${panelSize.value.width}px`,
  height: isMinimized.value ? '60px' : `${panelSize.value.height}px`
}))

const noteDialogStyle = computed(() => ({
  left: `${noteDialogPosition.value.x}px`,
  top: `${noteDialogPosition.value.y}px`
}))


onMounted(() => {
  const articleId = route.params.id
  if (articleId) {
    loadArticle(articleId)
    loadComments(articleId)  // 加载评论数据
  } else {
    error.value = '文章ID不存在'
    loading.value = false
  }
    // 添加全局事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleMouseMove)
  document.addEventListener('touchend', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleMouseMove)
  document.removeEventListener('touchend', handleMouseUp)
})


// 加载文章详情
const loadArticle = async (id) => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('正在加载文章详情，ID:', id)
    
    const response = await fetch(`http://localhost:3000/api/articles/${id}`)
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('文章详情加载结果:', result)
    
    if (result.code === 200) {
      article.value = result.data
      
      // 立即加载评论
      await loadComments(id)
      
      // 更新浏览量（调用后端API）
      await updateArticleViews(id)
      
    } else {
      throw new Error(result.message || '文章不存在')
    }
    
  } catch (err) {
    error.value = err.message || '加载文章失败'
    console.error('加载文章失败:', err)
    
    // 如果后端API不可用，可以使用备用数据
    if (err.message.includes('Failed to fetch')) {
      console.log('后端API不可用，使用模拟数据...')
      // 这里可以保留原有的模拟数据逻辑
    }
  } finally {
    loading.value = false
  }
}

// 新增：更新浏览量函数
const updateArticleViews = async (articleId) => {
  try {
    // 这里可以调用后端API更新浏览量
    // 或者在前端简单的加1
    if (article.value) {
      article.value.views = (article.value.views || 0) + 1
    }
  } catch (err) {
    console.error('更新浏览量失败:', err)
  }
}

// 加载评论
const loadComments = async (articleId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/comments?articleId=${articleId}`)
    if (response.ok) {
      const result = await response.json()
      if (result.code === 200) {
        comments.value = result.data
        commentCount.value = result.data.length
      }
    }
  } catch (err) {
    console.error('加载评论失败:', err)
  }
}

// 打开评论弹窗
const openCommentPanel = () => {
  showCommentPanel.value = true
  isMinimized.value = false
}

// 关闭评论弹窗
const closeCommentPanel = () => {
  showCommentPanel.value = false
}

// 最小化弹窗
const minimizePanel = () => {
  isMinimized.value = !isMinimized.value
}

// 开始拖拽
const startDrag = (e) => {
  e.preventDefault()
  isDragging.value = true
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  dragStart.value = {
    x: clientX - panelPosition.value.x,
    y: clientY - panelPosition.value.y
  }
}

// 开始调整大小
const startResize = (e) => {
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  dragStart.value = {
    x: e.clientX,
    y: e.clientY
  }
  startSize.value = { ...panelSize.value }
}

// 处理鼠标移动
const handleMouseMove = (e) => {
  if (!isDragging.value && !isResizing.value) return
  
  e.preventDefault()
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  
  if (isDragging.value) {
    panelPosition.value = {
      x: clientX - dragStart.value.x,
      y: clientY - dragStart.value.y
    }
  }
  
  if (isResizing.value) {
    const deltaX = clientX - dragStart.value.x
    const deltaY = clientY - dragStart.value.y
    
    panelSize.value = {
      width: Math.max(300, startSize.value.width + deltaX),
      height: Math.max(200, startSize.value.height + deltaY)
    }
  }
}

// 处理鼠标抬起
const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
}
// 发表评论（修改为真实API调用）
const submitComment = async () => {
  if (!newComment.value.trim()) {
    alert('请输入评论内容')
    return
  }
  
  try {
    const commentData = {
      articleId: route.params.id,
      content: newComment.value,
      author: '当前用户'  // 这里可以改成真实用户名
    }
    
    console.log('正在发表评论...', commentData)
    
    // 1. 调用真实API提交评论
    const response = await fetch('http://localhost:3000/api/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API返回错误:', errorText)
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('评论发表结果:', result)
    
    if (result.code === 200) {
      // 2. 发表成功后清空输入框
      newComment.value = ''
      
      // 3. 重新加载评论列表（显示新发表的评论）
      await loadComments(route.params.id)
      
      // 4. 给用户成功提示
      alert('评论发表成功！')
    } else {
      alert(result.message || '发表失败，请重试')
    }
    
  } catch (err) {
    console.error('发表评论失败:', err)
    
    // 根据错误类型给出不同提示
    if (err.message.includes('Failed to fetch')) {
      alert('无法连接到服务器，请检查：\n1. 后端服务器是否启动\n2. 网络连接是否正常')
    } else if (err.message.includes('HTTP错误')) {
      alert(`服务器错误：${err.message}`)
    } else {
      alert('评论发表失败，请稍后重试')
    }
  }
}

// 点赞评论
const likeComment = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.likes = (comment.likes || 0) + 1
  }
}

// 回复评论
const replyToComment = (commentId) => {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    newComment.value = `回复 ${comment.author}：`
    // 聚焦到输入框
    const textarea = document.querySelector('.comment-input')
    if (textarea) {
      setTimeout(() => {
        textarea.focus()
      }, 100)
    }
  }
}

// 双击页面处理
const handleDoubleClick = (e) => {
  // 防止双击时选中文本
  e.preventDefault()
  noteDialogPosition.value = {
    x: Math.min(e.clientX, window.innerWidth - 320), // 确保弹窗不会超出屏幕
    y: Math.min(e.clientY, window.innerHeight - 300)
  }
  noteContent.value = ''
  showNoteDialog.value = true
}

// 保存笔记
const saveNote = () => {
  if (noteContent.value.trim()) {
    const notes = JSON.parse(localStorage.getItem('article_notes') || '[]')
    notes.push({
      articleId: route.params.id,
      content: noteContent.value,
      createdAt: new Date().toISOString(),
      position: noteDialogPosition.value
    })
    localStorage.setItem('article_notes', JSON.stringify(notes))
    
    alert('笔记已保存！')
    closeNoteDialog()
  }
}

// 关闭笔记弹窗
const closeNoteDialog = () => {
  showNoteDialog.value = false
}

// 点赞文章
const likeArticle = async () => {
  if (!article.value) return
  
  try {
    const articleId = route.params.id
    console.log('正在点赞文章:', articleId)
    
    const response = await fetch(`http://localhost:3000/api/articles/${articleId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('点赞结果:', result)
    
    if (result.code === 200) {
      // 更新本地数据
      article.value.likes = result.data.likes
      alert('点赞成功！')
    }
    
  } catch (err) {
    console.error('点赞失败:', err)
    
    // 如果API不可用，使用前端模拟
    if (err.message.includes('Failed to fetch')) {
      article.value.likes = (article.value.likes || 0) + 1
      alert('点赞成功（模拟模式）')
    } else {
      alert('点赞失败，请重试')
    }
  }
}

// 分享文章
const shareArticle = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    alert('文章链接已复制到剪贴板！')
  })
}

// 收藏文章
const bookmarkArticle = () => {
  alert('已收藏这篇文章！')
}

// 通过标签搜索
const searchByTag = (tag) => {
  router.push(`/artlist?tag=${tag}`)
}

// 重试加载
const retryLoad = () => {
  if (route.params.id) {
    loadArticle(route.params.id)
    loadComments(route.params.id)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '刚刚'
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 渲染 Markdown 内容
const renderContent = (content) => {
  if (!content) return ''
  
  return DOMPurify.sanitize(marked(content))
}
</script>

<style scoped>
.article-detail-container {
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f8f9fa;
  position: relative;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #855b90;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin: 0 0 1.5rem 0;
  color: #c62828;
}

.retry-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(133, 91, 144, 0.2);
}

/* 文章内容区域 */
.article-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: text;
  position: relative;
}

/* 文章标题区域 */
.article-title-section {
  margin-bottom: 1.5rem;
}

.article-title {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  line-height: 1.3;
}

.title-underline {
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  border-radius: 2px;
}

/* 文章元信息 */
.article-meta-info {
  margin-bottom: 1.5rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.separator {
  color: #999;
}

.publish-time {
  font-size: 13px;
  color: #666;
}

.article-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 文章标签 */
.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.tag {
  padding: 0.4rem 0.8rem;
  background: #f0f7ff;
  border: 1px solid #d0e3ff;
  border-radius: 16px;
  font-size: 12px;
  color: #2c5282;
  cursor: pointer;
  transition: all 0.3s;
}

.tag:hover {
  background: #e1f0ff;
  transform: translateY(-1px);
}

/* 文章摘要卡片 */
.article-summary-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  border-left: 4px solid #94b4eb;
}

.article-summary-card h3 {
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.article-summary-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

/* 文章主体内容 */
.article-body {
  font-size: 1.125rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 2rem;
}

.content h2 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.content h3 {
  font-size: 1.25rem;
  margin: 1.5rem 0 0.75rem;
  color: #333;
}

.content p {
  margin: 1rem 0;
}

.content a {
  color: #855b90;
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

.content code {
  background: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.content pre {
  background: #f6f8fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1rem 0;
  font-size: 14px;
}

.content blockquote {
  border-left: 4px solid #94b4eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #666;
  font-style: italic;
}

.content ul, .content ol {
  padding-left: 2rem;
  margin: 1rem 0;
}

.content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1rem 0;
}

/* 文章底部操作 */
.article-footer {
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.footer-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 新增评论按钮样式 */
.comment-btn:hover {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #4caf50;
}

.like-btn:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

.share-btn:hover {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #2196f3;
}

.bookmark-btn:hover {
  background: #fff8e6;
  border-color: #ffa600;
  color: #ffa600;
}

.action-icon {
  font-size: 16px;
}

.count {
  font-weight: 600;
}

.update-info {
  font-size: 13px;
  color: #999;
  text-align: center;
}

/* ============ 评论弹窗样式 ============ */
.comment-panel {
  position: fixed;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 300px;
  min-height: 200px;
  resize: both;
}

.panel-header {
  padding: 1rem;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comment-count {
  font-size: 12px;
  opacity: 0.9;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

.header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn:hover {
  background: #ff5252;
}

.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comment-input-section {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 0.75rem;
}

.comment-input:focus {
  outline: none;
  border-color: #94b4eb;
  box-shadow: 0 0 0 2px rgba(148, 180, 235, 0.2);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(133, 91, 144, 0.2);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
}

.comment-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 0.5rem;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.comment-action-btn {
  padding: 0.25rem 0.75rem;
  background: #f5f5f5;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.comment-action-btn:hover {
  background: #e0e0e0;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #999;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  background: linear-gradient(135deg, transparent 50%, #94b4eb 50%);
  border-bottom-right-radius: 12px;
}

/* ============ 笔记弹窗样式 ============ */
.note-dialog {
  position: fixed;
  z-index: 1001;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 300px;
  overflow: hidden;
}

.note-header {
  padding: 0.75rem 1rem;
  background: #ffeb3b;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-header h4 {
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.note-close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.note-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.note-content {
  padding: 1rem;
}

.note-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ffeb3b;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1rem;
}

.note-input:focus {
  outline: none;
  border-color: #fbc02d;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.save-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.save-btn {
  background: #4caf50;
  color: white;
}

.save-btn:hover {
  background: #45a049;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .article-detail-container {
    padding: 1rem;
  }
  
  .article-content {
    padding: 1.5rem;
  }
  
  .article-title {
    font-size: 1.75rem;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .comment-panel {
    left: 1rem !important;
    right: 1rem !important;
    top: 50% !important;
    transform: translateY(-50%);
    width: calc(100% - 2rem) !important;
    max-width: none !important;
  }
  
  .note-dialog {
    left: 1rem !important;
    right: 1rem !important;
    top: 50% !important;
    transform: translateY(-50%);
    width: calc(100% - 2rem) !important;
  }
}
</style>