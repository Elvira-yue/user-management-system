<template>
  <div class="auth-page">
    <div class="auth-orb orb-a"></div>
    <div class="auth-orb orb-b"></div>

    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-logo">U</div>
        <span>UserHub</span>
      </div>

      <h1 class="auth-title">欢迎回来</h1>
      <p class="auth-sub">登录后即可管理用户信息</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @keyup.enter="handleSubmit"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            :prefix-icon="User"
            clearable
            autocomplete="username"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>

        <el-button type="primary" class="auth-submit" :loading="loading" @click="handleSubmit">
          登 录
        </el-button>
      </el-form>

      <div class="auth-footer">
        还没有账号？
        <router-link class="auth-link" to="/register">立即注册</router-link>
      </div>
    </div>

    <p class="auth-copyright">© 2026 UserHub · 用户管理系统</p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { login } from '../api/auth';
import { setAuth } from '../utils/auth';

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function handleSubmit() {
  try {
    await formRef.value.validate();
  } catch (err) {
    return;
  }

  loading.value = true;
  try {
    const data = await login({ username: form.username.trim(), password: form.password });
    setAuth(data.token, data.user);
    ElMessage.success('登录成功');
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/users';
    router.replace(redirect);
  } catch (err) {
    // 错误提示由 axios 拦截器统一处理
  } finally {
    loading.value = false;
  }
}
</script>
