<template>
  <div class="create-article-page">
    <!-- 主要内容编辑区 -->
    <div class="editor-container">
      <!-- 标题和基本信息 -->
      <div class="article-meta">
        <div class="title-input">
          <input
            v-model="article.title"
            type="text"
            placeholder="请输入文章标题..."
            class="title-field"
            maxlength="100"
          />
          <span class="char-count">{{ article.title.length }}/100</span>
        </div>
        
        <div class="meta-row">
          <!-- 标签选择 -->
          <div class="tag-selector">
            <div class="selected-tags">
              <div
                v-for="tag in article.tags"
                :key="tag"
                class="selected-tag"
              >
                {{ tag }}
                <span @click="removeTag(tag)" class="remove-tag">×</span>
              </div>
            </div>
            
            <div class="common-tags">
              <span class="common-label">常用标签：</span>
              <button
                v-for="tag in commonTags"
                :key="tag"
                @click="addTag(tag)"
                class="common-tag"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          
          <!-- 摘要 -->
          <div class="summary-input">
            <textarea
              v-model="article.summary"
              placeholder="文章摘要（选填）"
              class="summary-field"
              rows="2"
              maxlength="200"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Markdown 编辑器和预览 -->
      <div class="editor-preview-wrapper">
        <div class="editor-preview">
          <!-- 编辑模式切换 -->
          <div class="mode-toggle">
            <button 
              @click="togglePreview" 
              class="toggle-btn"
              :title="previewVisible ? '收起预览' : '展开预览'"
            >
              {{ previewVisible ? '◀' : '▶' }}
            </button>
          </div>
          
          <div class="editor-content">
            <!-- 编辑器 -->
            <div class="editor-section">
              <!-- 编辑器工具栏 -->
              <div class="toolbar">
                <div class="toolbar-group">
                  <button @click="insertText('**', '**')" title="加粗">
                    <strong>B</strong>
                  </button>
                  <button @click="insertText('*', '*')" title="斜体">
                    <em>I</em>
                  </button>
                  <button @click="insertText('# ', '')" title="标题">
                    H
                  </button>
                  <button @click="insertText('```\n', '\n```')" title="代码块">
                    &lt;/&gt;
                  </button>
                </div>
                
                <div class="toolbar-group">
                  <button @click="insertText('- ', '')" title="列表">
                    📋
                  </button>
                  <button @click="insertText('1. ', '')" title="有序列表">
                    1.
                  </button>
                  <button @click="insertText('[链接](url)', '')" title="链接">
                    🔗
                  </button>
                  <button @click="insertText('![图片](url)', '')" title="图片">
                    🖼️
                  </button>
                </div>
                
                <div class="toolbar-right">
                  <div class="word-count">
                    字数: {{ wordCount }}
                  </div>
                  <button 
                    @click="togglePreview" 
                    class="preview-toggle-btn"
                    :class="{ active: previewVisible }"
                  >
                    {{ previewVisible ? '收起预览' : '展开预览' }}
                  </button>
                </div>
              </div>
              
              <!-- Markdown 编辑器 -->
              <textarea
                v-model="article.content"
                ref="editor"
                class="markdown-editor"
                placeholder="开始写作吧...（支持 Markdown 语法）"
                @input="handleInput"
                @keydown.tab.prevent="insertTab"
              ></textarea>
            </div>
            
            <!-- 预览侧边栏 -->
            <div class="preview-sidebar" :class="{ collapsed: !previewVisible }">
              <div class="preview-header">
                <h3>预览</h3>
                <div class="preview-actions">
                  <div v-if="autoSaveTime" class="auto-save">
                    自动保存: {{ formatTime(autoSaveTime) }}
                  </div>
                  <button @click="togglePreview" class="close-preview" title="收起">
                    ×
                  </button>
                </div>
              </div>
              <div class="markdown-preview">
                <h1 v-if="article.title">{{ article.title }}</h1>
                <div v-if="article.content" v-html="compiledMarkdown"></div>
                <div v-else class="empty-preview">
                  <div class="empty-content">
                    <p>开始写作后，这里会显示预览效果</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="showSuccess" class="save-success">
      ✅ {{ successMessage }}
    </div>

    <!-- 离开页面确认 -->
    <div v-if="showLeaveConfirm" class="leave-confirm">
      <div class="confirm-content">
        <p>您有未保存的更改，确定要离开吗？</p>
        <div class="confirm-buttons">
          <button @click="confirmLeave" class="btn confirm-btn">离开</button>
          <button @click="cancelLeave" class="btn cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const router = useRouter()
const route = useRoute()

// 文章数据
const article = ref({
  id: null,
  title: '',
  content: '',
  summary: '',
  tags: [],
  status: 'draft',
  publishTime: null,
  category: '',
  cover: '',
  allowComments: true,
  isTop: false,
  wordCount: 0,
  readingTime: 0
})

// 状态
const isEditing = ref(false)
const saving = ref(false)
const previewVisible = ref(true) // 预览默认展开
const autoSaveTime = ref(null)
const showSuccess = ref(false)
const successMessage = ref('')
const showLeaveConfirm = ref(false)

// 标签相关
const tagInput = ref('')
const commonTags = ref(['前端', '后端', 'JavaScript', 'Vue', 'React', 'Node.js', 'CSS', 'HTML', '编程', '技术'])

// 计算属性
const wordCount = computed(() => {
  if (!article.value.content) return 0
  return article.value.content.trim().replace(/\s+/g, ' ').split(' ').length
})

const readingTime = computed(() => {
  return Math.ceil(wordCount.value / 200)
})

const canPublish = computed(() => {
  return article.value.title.trim() && article.value.content.trim()
})

const compiledMarkdown = computed(() => {
  if (!article.value.content) return ''
  return DOMPurify.sanitize(marked(article.value.content))
})

// 初始化
onMounted(() => {
  const editId = route.query.edit
  if (editId) {
    isEditing.value = true
    loadArticle(editId)
  }
  
  startAutoSave()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// 加载文章数据
const loadArticle = (id) => {
  const mockData = {
    id: parseInt(id),
    title: '示例文章标题',
    content: '# 这是示例文章\n\n这是一个Markdown示例。\n\n## 二级标题\n\n- 列表项1\n- 列表项2\n\n```javascript\nconsole.log("Hello World");\n```',
    summary: '这是一个示例文章的摘要',
    tags: ['示例', '测试'],
    status: 'draft',
    publishTime: null,
    category: '技术',
    cover: '',
    allowComments: true,
    isTop: false
  }
  
  article.value = { ...mockData }
}

// 标签操作
const addTag = (tag = tagInput.value.trim()) => {
  if (!tag) return
  if (!article.value.tags.includes(tag)) {
    article.value.tags.push(tag)
  }
  tagInput.value = ''
}

const removeTag = (tag) => {
  article.value.tags = article.value.tags.filter(t => t !== tag)
}

// 编辑器操作
const insertText = (prefix, suffix = '') => {
  const editor = document.querySelector('.markdown-editor')
  if (!editor) return
  
  const start = editor.selectionStart
  const end = editor.selectionEnd
  const selectedText = article.value.content.substring(start, end)
  
  const newText = article.value.content.substring(0, start) + 
                  prefix + selectedText + suffix + 
                  article.value.content.substring(end)
  
  article.value.content = newText
  
  setTimeout(() => {
    editor.focus()
    editor.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
  }, 0)
}

const insertTab = () => {
  insertText('    ')
}

const handleInput = () => {
  // 实时输入处理
}

// 预览侧边栏控制
const togglePreview = () => {
  previewVisible.value = !previewVisible.value
}

// 自动保存
let autoSaveTimer = null
const startAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    if (article.value.title || article.value.content) {
      saveDraft(true)
    }
  }, 30000)
}

// 保存草稿
const saveDraft = async (silent = false) => {
  if (!article.value.title && !article.value.content) return
  
  saving.value = true
  
  article.value.wordCount = wordCount.value
  article.value.readingTime = readingTime.value
  
  if (!article.value.summary && article.value.content) {
    const plainText = article.value.content.replace(/[#*`\[\]()!]/g, '')
    article.value.summary = plainText.substring(0, 100) + '...'
  }
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (!article.value.id) {
      article.value.id = Date.now()
    }
    
    autoSaveTime.value = new Date()
    
    if (!silent) {
      showSuccessMessage('草稿已保存')
    }
    
    console.log('文章已保存:', article.value)
    
  } catch (error) {
    console.error('保存失败:', error)
    if (!silent) {
      alert('保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 发布文章
const publishArticle = async () => {
  if (!canPublish.value) {
    alert('请填写标题和内容')
    return
  }
  
  if (!confirm('确定要发布这篇文章吗？')) return
  
  saving.value = true
  
  try {
    article.value.status = 'published'
    article.value.publishTime = new Date().toISOString()
    article.value.wordCount = wordCount.value
    article.value.readingTime = readingTime.value
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showSuccessMessage('文章发布成功！')
    
    setTimeout(() => {
      router.push('/artlist')
    }, 2000)
    
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  } finally {
    saving.value = false
  }
}

// 辅助函数
const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 页面离开确认
const handleBeforeUnload = (e) => {
  if (article.value.title || article.value.content) {
    e.preventDefault()
    e.returnValue = ''
  }
}

const confirmLeave = () => {
  showLeaveConfirm.value = false
  router.push('/artlist')
}

const cancelLeave = () => {
  showLeaveConfirm.value = false
}
</script>

<style scoped>
.create-article-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

/* 文章元信息 */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow: hidden;
  height: 100%;
}

.article-meta {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.title-input {
  margin-bottom: 1.5rem;
  position: relative;
}

.title-field {
  width: 100%;
  padding: 1rem;
  font-size: 1.75rem;
  font-weight: 300;
  border: none;
  border-bottom: 2px solid #e9ecef;
  background: transparent;
  transition: all 0.3s;
}

.title-field:focus {
  outline: none;
  border-bottom-color: #855b90;
}

.char-count {
  position: absolute;
  right: 1rem;
  bottom: 0.75rem;
  color: #999;
  font-size: 12px;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 标签选择器 */
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-tag {
  padding: 0.5rem 0.75rem;
  background: #f0f7ff;
  border: 1px solid #d0e3ff;
  border-radius: 16px;
  font-size: 13px;
  color: #2c5282;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag {
  cursor: pointer;
  font-size: 16px;
  color: #999;
  line-height: 1;
}

.remove-tag:hover {
  color: #ff4757;
}

.common-tags {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.common-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.common-tag {
  padding: 0.25rem 0.75rem;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.common-tag:hover {
  background: #e8e8e8;
  border-color: #855b90;
  color: #855b90;
}

/* 摘要输入 */
.summary-input {
  position: relative;
}

.summary-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s;
}

.summary-field:focus {
  outline: none;
  border-color: #855b90;
  box-shadow: 0 0 0 2px rgba(133, 91, 144, 0.1);
}

/* 编辑器预览容器 */
.editor-preview-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.editor-preview {
  height: 100%;
  display: flex;
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 预览切换按钮 */
.mode-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.toggle-btn {
  background: #855b90;
  color: white;
  border: none;
  width: 24px;
  height: 48px;
  border-radius: 12px 0 0 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.3s;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn:hover {
  background: #7a4f86;
  width: 28px;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: 100%;
}

/* 编辑器区域 */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
  border-right: 1px solid #e0e0e0;
  padding-right: 1rem;
}

.toolbar-group button {
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-group button:hover {
  background: #f0f0f0;
  border-color: #855b90;
  color: #855b90;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.word-count {
  color: #666;
  font-size: 13px;
  white-space: nowrap;
}

.preview-toggle-btn {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.preview-toggle-btn:hover {
  background: #e0e0e0;
}

.preview-toggle-btn.active {
  background: #855b90;
  color: white;
  border-color: #855b90;
}

/* Markdown 编辑器 */
.markdown-editor {
  flex: 1;
  padding: 1.5rem;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 16px;
  line-height: 1.6;
  background: white;
  min-height: 0;
  overflow-y: auto;
  height: calc(100% - 56px); /* 减去工具栏高度 */
}

.markdown-editor:focus {
  outline: none;
}

/* 预览侧边栏 */
.preview-sidebar {
  width: 500px;
  min-width: 500px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e9ecef;
  background: white;
  transition: all 0.3s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.preview-sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-left: none;
}

.preview-header {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 56px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.preview-header h3 {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auto-save {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.close-preview {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-preview:hover {
  background: #e0e0e0;
  color: #333;
}

/* 预览内容 */
.markdown-preview {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.8;
  color: #333;
  word-wrap: break-word;
  min-height: 0;
  height: calc(100% - 56px); /* 减去标题栏高度 */
}

.markdown-preview h1 {
  margin-top: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 1.5rem;
}

.markdown-preview h1:first-child {
  margin-top: 0;
}

.markdown-preview h2 {
  margin-top: 2rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #f0f0f0;
}

.markdown-preview pre {
  background: #f6f8fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-preview code {
  background: #f6f8fa;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

.markdown-preview blockquote {
  border-left: 4px solid #ddd;
  margin: 1.5rem 0;
  padding-left: 1rem;
  color: #666;
}

.markdown-preview ul, 
.markdown-preview ol {
  padding-left: 2rem;
  margin: 1rem 0;
}

.markdown-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

.empty-preview {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-content {
  text-align: center;
}

.empty-content p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

/* 成功提示 */
.save-success {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #0ca678;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 离开确认 */
.leave-confirm {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.confirm-content p {
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
}

.confirm-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.confirm-btn {
  background: #ff4757;
  color: white;
}

.confirm-btn:hover {
  background: #ff3742;
}

.cancel-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
}

.cancel-btn:hover {
  background: #e9ecef;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .preview-sidebar {
    width: 400px;
    min-width: 400px;
  }
}

@media (max-width: 992px) {
  .preview-sidebar {
    width: 350px;
    min-width: 350px;
  }
}

@media (max-width: 768px) {
  .editor-content {
    flex-direction: column;
  }
  
  .preview-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    min-width: 100%;
    z-index: 100;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
    transform: translateX(0);
    transition: transform 0.3s ease;
  }
  
  .preview-sidebar.collapsed {
    transform: translateX(100%);
  }
  
  .mode-toggle {
    display: none;
  }
  
  .toolbar {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .toolbar-right {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }
  
  .editor-container {
    padding: 1rem;
    height: auto;
    min-height: 100vh;
  }
  
  .editor-preview-wrapper {
    height: 70vh;
    min-height: 500px;
  }
}

@media (max-width: 576px) {
  .editor-container {
    padding: 1rem;
  }
  
  .article-meta {
    padding: 1rem;
  }
  
  .title-field {
    font-size: 1.5rem;
    padding: 0.75rem;
  }
  
  .markdown-editor {
    padding: 1rem;
    font-size: 15px;
  }
  
  .markdown-preview {
    padding: 1.5rem;
  }
}
</style>