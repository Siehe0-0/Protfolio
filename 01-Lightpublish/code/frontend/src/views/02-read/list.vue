<template>
  <div class="article-list-page">
    <!-- 顶部搜索和筛选区域 -->
    <div class="list-header">
      <div class="search-section">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章标题或内容..."
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="search-btn">
            🔍
          </button>
        </div>
        
        <!-- 标签筛选 -->
        <div class="tags-filter">
          <span class="filter-label">标签筛选：</span>
          <div class="tags-container">
            <button
              v-for="tag in availableTags"
              :key="tag"
              :class="['tag-btn', { 'active': selectedTags.includes(tag) }]"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 足迹查看按钮 -->
      <button @click="viewHistory" class="history-btn">
        👣 查看足迹
      </button>
    </div>
    
    <!-- 文章列表 -->
    <div class="article-list">
      <div v-if="filteredArticles.length === 0" class="empty-state">
        📭 暂无文章
      </div>
      
      <!-- 修改这里：正确的循环和事件处理 -->
      <RouterLink 
        v-for="article in paginatedArticles"
        :key="article.id"
        :to="`/artlist/${article.id}`"
        class="article-card-link"
      >
        <div
          class="article-card"
          :class="{ 'draft': article.status === 'draft' }"
        >
          <div class="article-main">
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <div class="article-meta">
                <span class="article-status" :class="article.status">
                  {{ statusMap[article.status] }}
                </span>
                <span class="article-views">👁️ {{ article.views }} 浏览</span>
              </div>
            </div>
            
            <p class="article-summary">{{ article.summary }}</p>
            
            <div class="article-footer">
              <div class="article-tags">
                <span
                  v-for="tag in article.tags"
                  :key="tag"
                  class="tag"
                  @click.stop="searchByTag(tag)"
                >
                  {{ tag }}
                </span>
              </div>
              
              <div class="article-actions" @click.stop>
                <button @click="editArticle(article.id, $event)" class="action-btn edit">
                  ✏️ 编辑
                </button>
                <button @click="deleteArticle(article.id, $event)" class="action-btn delete">
                  🗑️ 删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 发布时间区域 -->
          <div class="publish-time">
            <div class="time-label">发布时间</div>
            <div class="time-value">{{ formatTime(article.publishTime) }}</div>
            <div v-if="article.updateTime" class="update-time">
              更新于 {{ formatTime(article.updateTime) }}
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
    
    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="prevPage"
        class="page-btn"
      >
        ← 上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
      
      <button
        :disabled="currentPage === totalPages"
        @click="nextPage"
        class="page-btn"
      >
        下一页 →
      </button>
    </div>
    
    <!-- 足迹弹窗 -->
    <div v-if="showHistory" class="history-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>浏览历史</h3>
          <button @click="showHistory = false" class="close-btn">×</button>
        </div>
        
        <div class="history-list">
          <div
            v-for="record in browseHistory"
            :key="record.id"
            class="history-item"
          >
            <div class="history-title">{{ record.articleTitle }}</div>
            <div class="history-time">
              浏览时间：{{ formatTime(record.viewTime) }}
            </div>
            <button 
              @click="goToArticle(record.articleId)"
              class="view-again-btn"
            >
              再次查看
            </button>
          </div>
          
          <div v-if="browseHistory.length === 0" class="empty-history">
            暂无浏览记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索和筛选相关
const searchQuery = ref('')
const selectedTags = ref([])
const currentPage = ref(1)
const pageSize = 5
const showHistory = ref(false)

// 真实数据（从 API 获取）
const articles = ref([])
const availableTags = ref([])

// 浏览历史数据（从 API 获取）
const browseHistory = ref([])

// 加载文章列表
const loadArticles = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/articles')
    if (!response.ok) throw new Error('获取文章失败')
    
    const result = await response.json()
    if (result.code === 200) {
      articles.value = result.data || []
      // 提取所有标签
      const tags = new Set()
      articles.value.forEach(article => {
        if (article.tags) {
          article.tags.forEach(tag => tags.add(tag))
        }
      })
      availableTags.value = Array.from(tags)
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  }
}

// 加载浏览历史
const loadBrowseHistory = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return
    
    const response = await fetch(`http://localhost:3000/api/users/${user.id}/history`)
    if (!response.ok) throw new Error('获取历史失败')
    
    const result = await response.json()
    if (result.code === 200) {
      browseHistory.value = result.data || []
    }
  } catch (error) {
    console.error('加载浏览历史失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadArticles()
  loadBrowseHistory()
})

// 状态映射
const statusMap = {
  draft: '草稿',
  published: '已发布',
  reviewing: '审核中'
}

// 计算属性
const filteredArticles = computed(() => {
  let result = articles.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query)
    )
  }
  
  // 标签过滤
  if (selectedTags.value.length > 0) {
    result = result.filter(article =>
      selectedTags.value.every(tag => article.tags.includes(tag))
    )
  }
  
  return result
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.value.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  return Math.ceil(filteredArticles.value.length / pageSize)
})

// 方法
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1 // 重置到第一页
}

const handleSearch = () => {
  currentPage.value = 1
}

const viewHistory = () => {
  showHistory.value = true
}

// 编辑文章（阻止事件冒泡）
const editArticle = (id, event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  router.push(`/create?edit=${id}`)
}

// 删除文章（阻止事件冒泡）
const deleteArticle = (id, event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  if (confirm('确定要删除这篇文章吗？')) {
    articles.value = articles.value.filter(article => article.id !== id)
  }
}

// 通过标签搜索
const searchByTag = (tag) => {
  event?.stopPropagation()
  router.push(`/artlist?tag=${tag}`)
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
  showHistory.value = false
}

const formatTime = (timeString) => {
  if (!timeString) return '未发布'
  
  const date = new Date(timeString)
  
  // 只显示年月日
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}


</script>

<style scoped>
.article-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部区域 */
.list-header {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.search-section {
  flex: 1;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #7FBB8A;
  box-shadow: 0 0 0 2px rgba(127, 187, 138, 0.1);
}

.search-btn {
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #7FBB8A 0%, #6AA875 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.search-btn:hover {
  background: linear-gradient(135deg, #6AA875 0%, #5A9865 100%);
  transform: translateY(-1px);
}

/* 标签筛选 */
.tags-filter {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.filter-label {
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  padding-top: 0.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-btn {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.tag-btn:hover {
  background: #e8e8e8;
}

.tag-btn.active {
  background: linear-gradient(135deg, #7FBB8A 0%, #6AA875 100%);
  color: white;
  border-color: #7FBB8A;
}

/* 足迹按钮 */
.history-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FEE5D9 0%, #FDD5C4 100%);
  border: 1px solid #FCC4B0;
  border-radius: 8px;
  color: #8B6F47;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.history-btn:hover {
  background: linear-gradient(135deg, #FDD5C4 0%, #FCC4B0 100%);
  transform: translateY(-1px);
}

/* 文章列表 */
.article-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 文章卡片链接 */
.article-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
  margin-bottom: 1rem;
}

.article-card-link:last-child {
  margin-bottom: 0;
}

.article-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 2rem;
  border-left: 4px solid #7FBB8A;
  transition: all 0.3s;
  cursor: pointer;
}

.article-card-link:hover .article-card {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-left-color: #6AA875;
}

.article-card.draft {
  border-left-color: #ffc107;
  background: #fffcf3;
}

.article-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.article-title {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  font-weight: 600;
}

.article-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

.article-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.article-status.published {
  background: #e7f7ef;
  color: #0ca678;
}

.article-status.draft {
  background: #fff8e6;
  color: #ffa600;
}

.article-views {
  color: #666;
  font-size: 13px;
}

.article-summary {
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  flex: 1;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #F0F9F2 0%, #E8F5EB 100%);
  border-radius: 12px;
  font-size: 12px;
  color: #5A9865;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}

.tag:hover {
  background: linear-gradient(135deg, #E8F5EB 0%, #D5EDDC 100%);
  transform: translateY(-1px);
}

.article-actions {
  display: flex;
  gap: 0.75rem;
  position: relative;
  z-index: 10;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.edit:hover {
  background: linear-gradient(135deg, #F0F9F2 0%, #E8F5EB 100%);
  border-color: #7FBB8A;
  color: #6AA875;
}

.action-btn.delete:hover {
  background: #fde8e8;
  border-color: #f44336;
  color: #f44336;
}

/* 发布时间区域 */
.publish-time {
  width: 160px;
  background: linear-gradient(135deg, #F0F9F2 0%, #FEE5D9 100%);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid #D5EDDC;
  flex-shrink: 0;
}

.time-label {
  font-size: 12px;
  color: #7FBB8A;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.time-value {
  font-size: 1rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.update-time {
  font-size: 11px;
  color: #666;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #e0e0e0;
  width: 100%;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  font-size: 1.1rem;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  margin-top: 1rem;
}

.page-btn {
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7FBB8A 0%, #6AA875 100%);
  color: white;
  border-color: #7FBB8A;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-weight: 500;
}

/* 足迹弹窗 */
.history-modal {
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
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.history-item {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.history-title {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.history-time {
  color: #666;
  font-size: 13px;
}

.view-again-btn {
  padding: 0.5rem 1rem;
  background: #94b4eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.view-again-btn:hover {
  background: #855b90;
}

.empty-history {
  text-align: center;
  padding: 2rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .tags-filter {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .article-card {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .publish-time {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .time-label {
    margin-bottom: 0;
  }
  
  .article-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .article-actions {
    justify-content: flex-end;
  }
}
</style>