<template>
  <div class="login-container">
    <!-- 简化版登录页面 -->
    <div class="login-box">
      <h2>{{ isLoginMode ? '用户登录' : '新用户注册' }}</h2>
      
      <!-- 模式切换 -->
      <div class="mode-tabs">
        <button @click="switchMode('login')" :class="{ active: isLoginMode }">登录</button>
        <button @click="switchMode('register')" :class="{ active: !isLoginMode }">注册</button>
      </div>

      <!-- 登录表单 -->
      <form v-if="isLoginMode" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>手机号</label>
          <input 
            v-model="loginForm.phone" 
            type="tel" 
            placeholder="请输入手机号"
            :class="{ error: loginErrors.phone }"
          />
          <div v-if="loginErrors.phone" class="error">{{ loginErrors.phone }}</div>
        </div>

        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            :class="{ error: loginErrors.password }"
          />
          <div v-if="loginErrors.password" class="error">{{ loginErrors.password }}</div>
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-else @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label>手机号</label>
          <input 
            v-model="registerForm.phone" 
            type="tel" 
            placeholder="请输入手机号"
            :class="{ error: registerErrors.phone }"
          />
          <div v-if="registerErrors.phone" class="error">{{ registerErrors.phone }}</div>
        </div>

        <div class="form-group">
          <label>设置密码</label>
          <input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请设置6-20位密码"
            :class="{ error: registerErrors.password }"
          />
          <div v-if="registerErrors.password" class="error">{{ registerErrors.password }}</div>
        </div>

        <div class="form-group">
          <label>确认密码</label>
          <input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            :class="{ error: registerErrors.confirmPassword }"
          />
          <div v-if="registerErrors.confirmPassword" class="error">{{ registerErrors.confirmPassword }}</div>
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <!-- 消息提示 -->
      <div v-if="message" :class="['message', message.type]">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 模式状态
const isLoginMode = ref(true)

// 登录表单数据
const loginForm = reactive({
  phone: '',
  password: ''
})

// 注册表单数据
const registerForm = reactive({
  phone: '',
  password: '',
  confirmPassword: ''
})

// 错误信息
const loginErrors = reactive({
  phone: '',
  password: ''
})

const registerErrors = reactive({
  phone: '',
  password: '',
  confirmPassword: ''
})

// 状态
const loading = ref(false)
const message = ref(null)

// 切换模式
const switchMode = (mode) => {
  isLoginMode.value = mode === 'login'
  clearErrors()
  clearMessage()
}

// 清除错误
const clearErrors = () => {
  Object.keys(loginErrors).forEach(key => loginErrors[key] = '')
  Object.keys(registerErrors).forEach(key => registerErrors[key] = '')
}

const clearMessage = () => {
  message.value = null
}

// 验证手机号格式
const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 登录表单验证
const validateLoginForm = () => {
  let isValid = true
  
  if (!loginForm.phone.trim()) {
    loginErrors.phone = '请输入手机号'
    isValid = false
  } else if (!validatePhone(loginForm.phone)) {
    loginErrors.phone = '请输入有效的手机号'
    isValid = false
  }
  
  if (!loginForm.password) {
    loginErrors.password = '请输入密码'
    isValid = false
  } else if (loginForm.password.length < 6) {
    loginErrors.password = '密码长度至少6位'
    isValid = false
  }
  
  return isValid
}

// 注册表单验证
const validateRegisterForm = () => {
  let isValid = true
  
  if (!registerForm.phone.trim()) {
    registerErrors.phone = '请输入手机号'
    isValid = false
  } else if (!validatePhone(registerForm.phone)) {
    registerErrors.phone = '请输入有效的手机号'
    isValid = false
  }
  
  if (!registerForm.password) {
    registerErrors.password = '请输入密码'
    isValid = false
  } else if (registerForm.password.length < 6 || registerForm.password.length > 20) {
    registerErrors.password = '密码长度为6-20位'
    isValid = false
  }
  
  if (!registerForm.confirmPassword) {
    registerErrors.confirmPassword = '请确认密码'
    isValid = false
  } else if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }
  
  return isValid
}

// 处理登录
const handleLogin = async () => {
  if (!validateLoginForm()) return
  
  loading.value = true
  clearMessage()
  
  try {
    // 调用后端登录接口
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      phone: loginForm.phone,
      password: loginForm.password
    })
    
    const { token, user } = response.data.data
    
    // 保存用户信息到本地存储
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    // 显示成功消息
    message.value = {
      type: 'success',
      text: '登录成功！正在跳转...'
    }
    
    // 延迟跳转到用户主页
    setTimeout(() => {
      router.push('/home')
    }, 1000)
    
  } catch (error) {
    console.error('登录失败:', error)
    
    let errorMsg = '登录失败，请稍后重试'
    if (error.response) {
      switch (error.response.status) {
        case 400: errorMsg = '请求参数错误'; break
        case 401: errorMsg = '手机号或密码错误'; break
        case 404: errorMsg = '用户不存在'; break
        default: errorMsg = error.response.data?.message || errorMsg
      }
    } else if (error.request) {
      errorMsg = '网络错误，请检查后端服务器是否启动'
    }
    
    message.value = { type: 'error', text: errorMsg }
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!validateRegisterForm()) return
  
  loading.value = true
  clearMessage()
  
  try {
    // 调用后端注册接口
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      phone: registerForm.phone,
      password: registerForm.password
    })
    
    const { token, user } = response.data.data
    
    // 保存用户信息
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    // 显示成功消息
    message.value = {
      type: 'success',
      text: '注册成功！正在登录...'
    }
    
    // 延迟跳转到用户主页
    setTimeout(() => {
      router.push('/home')
    }, 1000)
    
  } catch (error) {
    console.error('注册失败:', error)
    
    let errorMsg = '注册失败，请稍后重试'
    if (error.response) {
      switch (error.response.status) {
        case 400: errorMsg = '请求参数错误'; break
        case 409: errorMsg = '手机号已注册'; break
        default: errorMsg = error.response.data?.message || errorMsg
      }
    } else if (error.request) {
      errorMsg = '网络错误，请检查后端服务器是否启动'
    }
    
    message.value = { type: 'error', text: errorMsg }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #ace39b9c 100%);
  overflow: hidden;
  position: fixed; /* 使用 fixed 定位 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.mode-tabs {
  display: flex;
  margin-bottom: 30px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.mode-tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.mode-tabs button.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  outline: none;
}

input:focus {
  border-color: #667eea;
}

input.error {
  border-color: #ff4757;
}

.error {
  color: #ff4757;
  font-size: 12px;
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #ace39b9c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-tip {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.switch-tip a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}

.switch-tip a:hover {
  text-decoration: underline;
}

.message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>