<template>
<div class="welcome-container">
  <div class="welcome-page">
    <!-- 顶部导航（仅在欢迎页显示） -->
    <header class="welcome-header">
      <div class="container">
        <div class="logo-area">
          <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="60" height="60" />
          <h1>LightPublish</h1>
        </div>
        
        <nav class="welcome-nav">
          <RouterLink to="/login">登录</RouterLink>
        </nav>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="welcome-main">
      <div class="hero-section">
        <h2>欢迎使用 LightPublish</h2>
        <p>一个轻量级的知识发布与管理平台</p>
        <div class="hero-actions">
          <RouterLink to="/ehome" class="btn btn-primary">快速使用</RouterLink>
        </div>
      </div>
    </main>
  </div>
</div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.welcome-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed; /* 使用 fixed 定位 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.welcome-page {
  width: 100%;
  height: 100%;
}

.welcome-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-area h1 {
  font-size: 1.5rem;
  color: #333;
}

.welcome-nav {
  display: flex;
  gap: 2rem;
}

.welcome-nav a {
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s;
}

.welcome-nav a:hover {
  color: #2575fc;
  background: rgba(37, 117, 252, 0.1);
}

.welcome-main {
  padding-top: 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-section {
  text-align: center;
  max-width: 800px;
  padding: 3rem;
}

.hero-section h2 {
  font-size: 3rem;
  color: #54a05c;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
</style>