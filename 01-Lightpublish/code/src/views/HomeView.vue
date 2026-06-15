<template>
  <div class="home-container">
    <div class="home-page">
      <div class="home-layout" :class="{ 'sidebar-collapsed': isCollapsed }">
        <!-- 侧边栏 -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <img alt="Logo" src="@/assets/logo.svg" width="40" height="40" />
            <h3 v-show="!isCollapsed">LightPublish</h3>
            
            <!-- 折叠按钮 -->
            <button @click="toggleSidebar" class="collapse-btn">
              {{ isCollapsed ? '➡️' : '⬅️' }}
            </button>
          </div>
          
          <nav class="sidebar-nav">
            <RouterLink to="/home" class="nav-item">
              <span>🏠</span>
              <span v-show="!isCollapsed">首页</span>
            </RouterLink>
            <RouterLink to="/artlist" class="nav-item">
              <span>📝</span>
              <span v-show="!isCollapsed">文章列表</span>
            </RouterLink>
            <RouterLink to="/create" class="nav-item">
              <span>✏️</span>
              <span v-show="!isCollapsed">写文章</span>
            </RouterLink>
            <RouterLink to="/user" class="nav-item">
              <span>👤</span>
              <span v-show="!isCollapsed">个人中心</span>
            </RouterLink>
          </nav>
          
          <div class="sidebar-footer">
            <button @click="logout" class="logout-btn">
              <span>🚪</span>
              <span v-show="!isCollapsed">退出登录</span>
            </button>
          </div>
        </aside>

        <!-- 主内容区 -->
        <main class="main-content">
          <div class="content-header">
            <button @click="toggleSidebar" class="menu-toggle">
              ☰
            </button>
            <h2>欢迎回来！{{ userInfo.name || '用户' }}</h2>
            <div class="user-info">
              <span>📅 {{ currentDate }}</span>
            </div>
          </div>
          
          <div class="content-body">
             <!-- ========= 添加的测试区域 ========= -->
            <div class="backend-test-section">
              <h3>后端连接测试</h3>
              
              <!-- 后端状态显示 -->
              <div class="server-status" :class="serverStatus.class">
                <span class="status-icon">{{ serverStatus.icon }}</span>
                {{ serverStatus.message }}
              </div>
              
              <!-- 测试按钮 -->
              <div class="test-buttons">
                <button @click="testBackend" class="test-btn">
                  {{ testing ? '测试中...' : '测试后端连接' }}
                </button>
                
                <button @click="getServerInfo" class="test-btn secondary">
                  获取服务器信息
                </button>
              </div>
              
              <!-- 结果显示 -->
              <div v-if="testResult" class="test-result">
                <h4>测试结果：</h4>
                <pre>{{ testResult }}</pre>
              </div>
              
              <!-- 错误显示 -->
              <div v-if="testError" class="test-error">
                <h4>错误信息：</h4>
                <p>{{ testError }}</p>
              </div>
              
              <!-- 后端时间 -->
              <div v-if="serverTime" class="server-time">
                <p>🕐 服务器时间：{{ serverTime }}</p>
              </div>
            </div>
            <!-- ========= 结束测试区域 ========= -->
            <!-- 这里显示子页面 -->
            <router-view></router-view>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userInfo = ref({})
const isCollapsed = ref(false) // 控制侧边栏是否折叠

// ========= 新增的后端测试相关变量 =========
const testing = ref(false)
const testResult = ref(null)
const testError = ref('')
const serverTime = ref('')

// 后端状态
const serverStatus = computed(() => {
  if (testError.value) {
    return {
      icon: '❌',
      message: '后端连接失败',
      class: 'status-error'
    }
  }
  if (testResult.value) {
    return {
      icon: '✅',
      message: '后端连接正常',
      class: 'status-success'
    }
  }
  return {
    icon: '⏳',
    message: '未测试后端连接',
    class: 'status-waiting'
  }
})
// ========= 结束新增 =========

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    userInfo.value = JSON.parse(user)
  }

   // 自动测试后端连接
  testBackend()
})

// ========= 新增的后端测试方法 =========
// 测试后端连接
const testBackend = async () => {
  testing.value = true
  testError.value = ''
  testResult.value = null
  
  try {
    const response = await fetch('http://localhost:3000/api/test')
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const data = await response.json()
    testResult.value = data
    
    // 保存服务器时间
    if (data.data?.time) {
      serverTime.value = data.data.time
    }
    
    console.log('✅ 后端连接成功:', data)
    
  } catch (error) {
    testError.value = error.message || '连接失败'
    console.error('❌ 后端连接失败:', error)
  } finally {
    testing.value = false
  }
}

// 获取服务器信息
const getServerInfo = async () => {
  try {
    const response = await fetch('http://localhost:3000/')
    const data = await response.json()
    
    // 显示在测试结果区域
    testResult.value = data
    console.log('服务器信息:', data)
    
  } catch (error) {
    testError.value = error.message
    console.error('获取服务器信息失败:', error)
  }
}
// ========= 结束新增 =========

// 切换侧边栏展开/折叠
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.home-page {
  height: 100vh;
  display: flex;
}

.home-layout {
  display: flex;
  flex: 1;
  height: 100%;
  transition: all 0.3s ease;
}

/* 侧边栏样式 */
.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  transition: all 0.3s ease;
  overflow: hidden;
  flex-shrink: 0; /* 防止被挤压 */
}

/* 折叠状态 */
.sidebar-collapsed .sidebar {
  width: 80px;
}

.sidebar-header {
  padding: 0 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  min-height: 50px; /* 确保高度固定 */
}

.sidebar-header h3 {
  font-size: 1.25rem;
  margin: 0;
  transition: opacity 0.3s;
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap; /* 防止文字换行 */
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-left: 4px solid white;
}

/* 折叠时隐藏文字 */
.sidebar-collapsed .nav-item span:last-child {
  display: none;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  transition: all 0.3s;
  white-space: nowrap; /* 防止文字换行 */
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 折叠时隐藏按钮文字 */
.sidebar-collapsed .logout-btn span:last-child {
  display: none;
}

/* 主要内容区 */
.main-content {
  flex: 1;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.content-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0; /* 防止被挤压 */
}

.menu-toggle {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.menu-toggle:hover {
  background: #f5f5f5;
}

.content-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  flex: 1;
}

.user-info {
  color: #666;
}

/* 内容主体区域 - 关键！ */
.content-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto; /* 允许垂直滚动 */
  height: calc(100vh - 80px); /* 减去头部高度 */
  box-sizing: border-box; /* 包含padding在高度内 */
}

/* 确保子页面自适应 */
.content-body > * {
  height: 100%; /* 子页面占满整个内容区域 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(0);
  }
  
  .sidebar-collapsed .sidebar {
    transform: translateX(-100%);
  }
  
  .menu-toggle {
    display: block;
  }
  
  .content-body {
    height: calc(100vh - 70px);
    padding: 1rem;
  }

  
/* ========= 新增的测试区域样式 ========= */
.backend-test-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.backend-test-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.25rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.server-status {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.status-success {
  background: #e8f5e8;
  color: #2e7d32;
  border-left: 4px solid #4caf50;
}

.status-error {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #f44336;
}

.status-waiting {
  background: #fff3e0;
  color: #ef6c00;
  border-left: 4px solid #ff9800;
}

.status-icon {
  font-size: 1.5rem;
}

.test-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.test-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #94b4eb 0%, #855b90 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  flex: 1;
  min-width: 150px;
}

.test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(133, 91, 144, 0.2);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.test-btn.secondary {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.test-btn.secondary:hover {
  background: #e8e8e8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.test-result,
.test-error {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.test-result h4,
.test-error h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.test-result pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  overflow-x: auto;
  color: #555;
  line-height: 1.5;
}

.test-error {
  background: #ffebee;
  border-color: #ffcdd2;
}

.test-error h4 {
  color: #c62828;
}

.server-time {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 6px;
  color: #1565c0;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .test-buttons {
    flex-direction: column;
  }
  
  .test-btn {
    width: 100%;
  }
  
  .backend-test-section {
    padding: 1.5rem;
    margin: 1rem;
  }
}
/* ========= 结束新增样式 ========= */
}
</style>