<template>
  <div class="auth-page">
    <div class="auth-orb orb-a"></div>
    <div class="auth-orb orb-b"></div>

    <div class="auth-card auth-card-wide">
      <div class="auth-brand">
        <div class="auth-logo">U</div>
        <span>UserHub</span>
      </div>

      <h1 class="auth-title">创建账号</h1>
      <p class="auth-sub">注册完成后将自动登录</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @keyup.enter="handleSubmit"
      >
        <div class="auth-grid">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" placeholder="3-20 位字母、数字或下划线" :prefix-icon="User" clearable />
          </el-form-item>

          <el-form-item label="姓名" prop="fullName">
            <el-input v-model="form.fullName" placeholder="请输入真实姓名" :prefix-icon="Postcard" clearable />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" placeholder="6-30 位密码" :prefix-icon="Lock" show-password />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" :prefix-icon="Lock" show-password />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入 11 位手机号" :prefix-icon="Iphone" clearable maxlength="11" />
          </el-form-item>

          <el-form-item label="所在城市" prop="city">
            <el-input v-model="form.city" placeholder="例如：杭州" :prefix-icon="Location" clearable />
          </el-form-item>
        </div>

        <el-button type="primary" class="auth-submit" :loading="loading" @click="handleSubmit">
          注 册
        </el-button>
      </el-form>

      <div class="auth-footer">
        已有账号？
        <router-link class="auth-link" to="/login">返回登录</router-link>
      </div>
    </div>

    <p class="auth-copyright">© 2026 UserHub · 用户管理系统</p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Iphone, Location, Postcard } from '@element-plus/icons-vue';
import { register } from '../api/auth';
import { setAuth } from '../utils/auth';

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  phone: '',
  city: ''
});

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '账号需为 3-20 位字母、数字或下划线', trigger: 'blur' }
  ],
  fullName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 50, message: '姓名不能超过 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度需为 6-30 位', trigger: 'blur' }
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  city: [{ required: true, message: '请输入所在城市', trigger: 'blur' }]
};

async function handleSubmit() {
  try {
    await formRef.value.validate();
  } catch (err) {
    return;
  }

  loading.value = true;
  try {
    const data = await register({
      username: form.username.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim()
    });
    setAuth(data.token, data.user);
    ElMessage.success('注册成功，已自动登录');
    router.replace('/users');
  } catch (err) {
    // 错误提示由 axios 拦截器统一处理
  } finally {
    loading.value = false;
  }
}
</script>
