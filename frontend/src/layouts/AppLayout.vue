<template>
  <el-container class="layout">
    <el-header class="layout-header">
      <div class="layout-brand" @click="router.push('/users')">
        <div class="brand-mark">U</div>
        <div class="brand-text">
          <span class="brand-name">UserHub</span>
          <span class="brand-sub">用户管理系统</span>
        </div>
      </div>

      <div class="header-right">
        <div class="user-chip">
          <el-avatar :size="34" class="user-avatar">{{ avatarText }}</el-avatar>
          <div class="user-meta">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-account">@{{ user ? user.username : '-' }}</span>
          </div>
        </div>
        <el-button text :icon="SwitchButton" class="logout-btn" @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>

    <el-main class="layout-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { SwitchButton } from '@element-plus/icons-vue';
import { getStoredUser, clearAuth } from '../utils/auth';

const router = useRouter();
const user = getStoredUser();

const displayName = computed(() => (user && (user.fullName || user.username)) || '未登录');
const avatarText = computed(() => (user && (user.fullName || user.username) || 'U').slice(0, 1));

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    type: 'warning',
    confirmButtonText: '退出',
    cancelButtonText: '取消'
  })
    .then(() => {
      clearAuth();
      ElMessage.success('已退出登录');
      router.replace({ name: 'login' });
    })
    .catch(() => {});
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.layout-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #eef1f7;
  position: sticky;
  top: 0;
  z-index: 10;
}

.layout-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f6ef7, #7c5cf7);
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.3px;
}

.brand-sub {
  font-size: 12px;
  color: #9aa3b2;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  background: #f5f7fc;
}

.user-avatar {
  background: linear-gradient(135deg, #4f6ef7, #7c5cf7);
  color: #fff;
  font-weight: 600;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
}

.user-account {
  font-size: 12px;
  color: #9aa3b2;
}

.logout-btn {
  color: #6b7280;
}

.layout-main {
  padding: 0;
  background: var(--page-bg);
}

@media (max-width: 640px) {
  .layout-header {
    padding: 0 14px;
  }

  .brand-sub,
  .user-meta,
  .logout-btn {
    display: none;
  }
}
</style>
