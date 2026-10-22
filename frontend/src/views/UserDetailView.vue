<template>
  <div class="page-container">
    <div class="toolbar">
      <el-button :icon="ArrowLeft" @click="router.push('/users')">返回列表</el-button>
    </div>

    <div v-loading="loading" class="card detail-card">
      <template v-if="user">
        <div class="detail-head">
          <el-avatar :size="56" class="detail-avatar">{{ avatarText }}</el-avatar>
          <div class="detail-title">
            <h2>{{ user.fullName }}</h2>
            <p class="muted">{{ user.city }} · 账号 {{ user.username }}</p>
          </div>
          <el-tag type="success" effect="light" round>用户 #{{ user.id }}</el-tag>
        </div>

        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="姓名">{{ user.fullName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ user.phone }}</el-descriptions-item>
          <el-descriptions-item label="所在城市">{{ user.city }}</el-descriptions-item>
          <el-descriptions-item label="登录账号">{{ user.username }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(user.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDateTime(user.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <el-empty v-else-if="!loading" description="用户不存在或已被删除" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { getUser } from '../api/user';
import { formatDateTime } from '../utils/format';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const user = ref(null);

const avatarText = computed(() => (user.value ? (user.value.fullName || user.value.username).slice(0, 1) : 'U'));

async function fetchDetail() {
  loading.value = true;
  try {
    user.value = await getUser(route.params.id);
  } catch (err) {
    user.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDetail);
</script>

<style scoped>
.detail-card {
  padding: 28px;
  min-height: 240px;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f2f7;
  margin-bottom: 24px;
}

.detail-avatar {
  background: linear-gradient(135deg, #4f6ef7, #7c5cf7);
  color: #fff;
  font-size: 22px;
  font-weight: 600;
}

.detail-title {
  flex: 1;
}

.detail-title h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.detail-title p {
  margin: 0;
  font-size: 13px;
}

@media (max-width: 640px) {
  .detail-card {
    padding: 18px;
  }

  .detail-head {
    flex-wrap: wrap;
  }

  .detail-descriptions {
    --el-descriptions-table-border: 1px solid #ebeef5;
  }
}
</style>
