<template>
  <div>
    <!-- 悬浮图标模式 -->
    <div 
      v-if="isFloated" 
      class="float-icon"
      :class="{ dragging: isDraggingFloat }"
      :style="floatIconStyle"
      @mousedown="startFloatDrag"
      @touchstart="startFloatDrag"
      @click="handleIconClick"
    >
      <span class="icon">💬</span>
    </div>

    <!-- 评论弹窗 -->
    <div 
      v-if="visible && !isFloated" 
      class="comment-panel"
      :style="panelStyle"
    >
    <!-- 弹窗头部 -->
    <div class="panel-header" @mousedown="startDrag" @touchstart="startDrag">
      <div class="header-left">
        <h3>💬 评论</h3>
        <span class="comment-count">{{ commentCount }} 条评论</span>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="handleMinimize">
          {{ isMinimized ? '📈' : '📉' }}
        </button>
        <button class="header-btn close-btn" @click="$emit('close')">
          ✕
        </button>
      </div>
    </div>

    <!-- 弹窗内容 -->
    <div v-if="!isMinimized" class="comment-content">
      <!-- 发表评论区域 -->
      <div class="comment-input-section" @mousedown.stop>
        <div v-if="replyTo" class="reply-indicator">
          <span>回复 <strong>{{ replyTo.author }}</strong></span>
          <button @click="cancelReply" class="cancel-reply-btn">×</button>
        </div>
        <textarea 
          v-model="newComment"
          :placeholder="replyTo ? `回复 @${replyTo.author}...` : '写下你的评论...'"
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
            {{ replyTo ? '回复' : '发表评论' }}
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
              <button @click="$emit('like-comment', comment.id)" class="comment-action-btn">
                ❤️ {{ comment.likes || 0 }}
              </button>
              <button @click="setReplyTarget(comment)" class="comment-action-btn">
                回复
              </button>
            </div>
            
            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-avatar">
                  {{ reply.author?.charAt(0) || '👤' }}
                </div>
                <div class="reply-body">
                  <div class="reply-header">
                    <span class="reply-author">{{ reply.author || '匿名用户' }}</span>
                    <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
                  </div>
                  <div class="reply-text">{{ reply.content }}</div>
                  <div class="reply-actions">
                    <button @click="$emit('like-comment', reply.id)" class="reply-action-btn">
                      ❤️ {{ reply.likes || 0 }}
                    </button>
                    <button @click="setReplyTarget(reply)" class="reply-action-btn">
                      回复
                    </button>
                  </div>
                </div>
              </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isMinimized: {
    type: Boolean,
    default: false
  },
  comments: {
    type: Array,
    default: () => []
  },
  commentCount: {
    type: Number,
    default: 0
  },
  articleId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits([
  'close',
  'submit-comment',
  'like-comment',
  'reply-comment',
  'update:visible'
])

const newComment = ref('')
const replyTo = ref(null) // 回复的目标评论

// 悬浮状态
const isFloated = ref(false)
const floatIconPosition = ref({ x: 20, y: 100 })
const isDraggingFloat = ref(false)
const floatDragStart = ref({ x: 0, y: 0 })
const hasDragged = ref(false) // 标记是否真正拖动过

// 弹窗位置和大小
const panelPosition = ref({ x: window.innerWidth - 420, y: 100 })
const panelSize = ref({ width: 400, height: 500 })
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const startSize = ref({ width: 0, height: 0 })

const panelStyle = computed(() => ({
  left: `${panelPosition.value.x}px`,
  top: `${panelPosition.value.y}px`,
  width: `${panelSize.value.width}px`,
  height: props.isMinimized ? '60px' : `${panelSize.value.height}px`
}))

const floatIconStyle = computed(() => ({
  left: `${floatIconPosition.value.x}px`,
  top: `${floatIconPosition.value.y}px`
}))

// 恢复面板
const restorePanel = () => {
  isFloated.value = false
  isMinimized.value = false
  // 将面板放回屏幕内
  panelPosition.value = {
    x: Math.max(0, Math.min(floatIconPosition.value.x, window.innerWidth - 400)),
    y: Math.max(0, Math.min(floatIconPosition.value.y, window.innerHeight - 200))
  }
}

// 处理最小化（切换为悬浮图标）
const handleMinimize = () => {
  // 切换到悬浮图标模式
  isFloated.value = true
  isMinimized.value = false
  // 保存当前位置到悬浮图标
  floatIconPosition.value = {
    x: Math.max(0, Math.min(panelPosition.value.x, window.innerWidth - 56)),
    y: Math.max(0, Math.min(panelPosition.value.y, window.innerHeight - 56))
  }
}

// 处理图标点击（区分点击和拖动）
const handleIconClick = () => {
  if (!hasDragged.value) {
    restorePanel()
  }
  hasDragged.value = false
}

// 开始拖动悬浮图标
const startFloatDrag = (e) => {
  e.preventDefault()
  isDraggingFloat.value = true
  hasDragged.value = false
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  floatDragStart.value = {
    x: clientX - floatIconPosition.value.x,
    y: clientY - floatIconPosition.value.y
  }
}

// 切换悬浮状态
const toggleFloat = () => {
  isFloated.value = !isFloated.value
  if (isFloated.value) {
    // 保存当前位置到悬浮图标
    floatIconPosition.value = {
      x: Math.max(0, Math.min(panelPosition.value.x, window.innerWidth - 50)),
      y: Math.max(0, Math.min(panelPosition.value.y, window.innerHeight - 50))
    }
  }
}

// 设置回复目标
const setReplyTarget = (comment) => {
  replyTo.value = comment
  // 自动聚焦到输入框
  setTimeout(() => {
    const textarea = document.querySelector('.comment-input')
    if (textarea) textarea.focus()
  }, 100)
}

// 取消回复
const cancelReply = () => {
  replyTo.value = null
  newComment.value = ''
}

// 提交评论
const submitComment = () => {
  if (!newComment.value.trim()) return
  
  // 如果有回复目标，发送回复事件
  if (replyTo.value) {
    emit('submit-comment', newComment.value, replyTo.value.id)
    replyTo.value = null
  } else {
    emit('submit-comment', newComment.value)
  }
  
  newComment.value = ''
}

// 拖拽功能
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

const handleMouseMove = (e) => {
  if (!isDragging.value && !isResizing.value && !isDraggingFloat.value) return
  
  e.preventDefault()
  const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  
  // 拖动悬浮图标
  if (isDraggingFloat.value) {
    const newX = clientX - floatDragStart.value.x
    const newY = clientY - floatDragStart.value.y
    
    // 检测是否真正移动了（降低阈值提升灵敏度）
    const moved = Math.abs(newX - floatIconPosition.value.x) > 1 || 
                  Math.abs(newY - floatIconPosition.value.y) > 1
    if (moved) {
      hasDragged.value = true
    }
    
    // 添加边界限制，但允许拖动到边缘
    floatIconPosition.value = {
      x: Math.max(0, Math.min(newX, window.innerWidth - 56)),
      y: Math.max(0, Math.min(newY, window.innerHeight - 56))
    }
    return
  }
  
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

const handleMouseUp = () => {
  if (isDragging.value) {
    // 检测是否拖出屏幕
    checkOutOfScreen()
  }
  isDragging.value = false
  isResizing.value = false
  isDraggingFloat.value = false
}

// 检测是否拖出屏幕
const checkOutOfScreen = () => {
  const panel = panelPosition.value
  const size = panelSize.value
  
  // 计算面板的边界
  const left = panel.x
  const right = panel.x + size.width
  const top = panel.y
  const bottom = panel.y + (props.isMinimized ? 60 : size.height)
  
  // 如果大部分区域在屏幕外
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  
  const outOfLeft = right < 50
  const outOfRight = left > screenWidth - 50
  const outOfTop = bottom < 50
  const outOfBottom = top > screenHeight - 50
  
  if (outOfLeft || outOfRight || outOfTop || outOfBottom) {
    // 切换到悬浮图标模式
    toggleFloat()
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

onMounted(() => {
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
</script>

<style scoped>
/* 悬浮图标 */
.float-icon {
  position: fixed;
  z-index: 999;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #94b4eb 0%, #8ceebfff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(148, 180, 235, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: none; /* 禁用默认触摸行为 */
  -webkit-tap-highlight-color: transparent; /* 移除点击高亮 */
}

.float-icon.dragging {
  transition: none !important; /* 拖动时禁用过渡，更跟手 */
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(148, 180, 235, 0.6);
}

.float-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(148, 180, 235, 0.6);
}

.float-icon .icon {
  font-size: 24px;
  animation: float-bounce 2s ease-in-out infinite;
}

@keyframes float-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

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
  background: linear-gradient(135deg, #94b4eb 0%, #a0ead4 100%);
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

.reply-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #F0F9F2 0%, #E8F5EB 100%);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 13px;
  color: #5A9865;
}

.reply-indicator strong {
  color: #7FBB8A;
}

.cancel-reply-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 0 0.25rem;
  line-height: 1;
}

.cancel-reply-btn:hover {
  color: #ff5252;
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
  background: linear-gradient(135deg, #94b4eb 0%, #8ceebfff 100%);
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
  background: linear-gradient(135deg, #94b4eb 0%, #8ceebfff 100%);
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

/* 回复列表 */
.replies-list {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.reply-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #F0F9F2 0%, #E8F5EB 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7FBB8A;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.reply-body {
  flex: 1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.reply-author {
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.reply-time {
  font-size: 11px;
  color: #999;
}

.reply-text {
  font-size: 13px;
  line-height: 1.5;
  color: #555;
  margin-bottom: 0.5rem;
}

.reply-actions {
  display: flex;
  gap: 0.75rem;
}

.reply-action-btn {
  padding: 0.2rem 0.5rem;
  background: transparent;
  border: none;
  font-size: 11px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.reply-action-btn:hover {
  color: #7FBB8A;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .comment-panel {
    left: 1rem !important;
    right: 1rem !important;
    top: 50% !important;
    transform: translateY(-50%);
    width: calc(100% - 2rem) !important;
    max-width: none !important;
  }
}
</style>
