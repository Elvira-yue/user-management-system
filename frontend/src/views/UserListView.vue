<template>
  <div class="page-container">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="keyword"
          placeholder="搜索姓名 / 手机号 / 城市 / 账号"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" plain @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-button type="primary" :icon="Plus" @click="openCreate">新增用户</el-button>
    </div>

    <div class="card table-card">
      <el-table v-loading="loading" :data="users" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="fullName" label="姓名" min-width="110" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="city" label="所在城市" min-width="110" />
        <el-table-column prop="username" label="账号" min-width="130" />
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无用户数据" />
        </template>
      </el-table>

      <div class="pagination">
        <span class="muted">共 {{ total }} 条记录</span>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          background
          layout="sizes, prev, pager, next, jumper"
          @current-change="fetchUsers"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="460px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <el-alert
        v-if="!isEdit"
        class="dialog-tip"
        type="info"
        :closable="false"
        show-icon
        title="初始账号为手机号，初始密码为 123456"
      />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="姓名" prop="fullName">
          <el-input v-model="form.fullName" placeholder="请输入姓名" maxlength="50" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入 11 位手机号" maxlength="11" clearable />
        </el-form-item>
        <el-form-item label="所在城市" prop="city">
          <el-input v-model="form.city" placeholder="例如：上海" maxlength="50" clearable />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ isEdit ? '保存' : '新增' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import { getUsers, createUser, updateUser, deleteUser } from '../api/user';
import { formatDateTime } from '../utils/format';

const router = useRouter();

const users = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const loading = ref(false);

const dialogVisible = ref(false);
const saving = ref(false);
const editingId = ref(null);
const formRef = ref(null);
const isEdit = computed(() => editingId.value !== null);

const form = reactive({
  fullName: '',
  phone: '',
  city: ''
});

const rules = {
  fullName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 50, message: '姓名不能超过 50 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  city: [{ required: true, message: '请输入所在城市', trigger: 'blur' }]
};

async function fetchUsers() {
  loading.value = true;
  try {
    const data = await getUsers({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim()
    });
    users.value = data.list;
    total.value = data.total;
  } catch (err) {
    users.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchUsers();
}

function handleReset() {
  keyword.value = '';
  page.value = 1;
  fetchUsers();
}

function handleSizeChange() {
  page.value = 1;
  fetchUsers();
}

function goDetail(row) {
  router.push({ name: 'user-detail', params: { id: row.id } });
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, { fullName: '', phone: '', city: '' });
  dialogVisible.value = true;
  nextTick(() => formRef.value && formRef.value.clearValidate());
}

function openEdit(row) {
  editingId.value = row.id;
  Object.assign(form, {
    fullName: row.fullName,
    phone: row.phone,
    city: row.city
  });
  dialogVisible.value = true;
  nextTick(() => formRef.value && formRef.value.clearValidate());
}

function handleDialogClosed() {
  editingId.value = null;
}

async function handleSubmit() {
  try {
    await formRef.value.validate();
  } catch (err) {
    return;
  }

  saving.value = true;
  const payload = {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    city: form.city.trim()
  };

  try {
    if (isEdit.value) {
      await updateUser(editingId.value, payload);
      ElMessage.success('修改成功');
    } else {
      await createUser(payload);
      ElMessage.success('新增成功（初始账号为手机号，初始密码 123456）');
    }
    dialogVisible.value = false;
    fetchUsers();
  } catch (err) {
    // 错误提示由 axios 拦截器统一处理
  } finally {
    saving.value = false;
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除用户「${row.fullName}」吗？删除后不可恢复。`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    confirmButtonClass: 'el-button--danger'
  })
    .then(async () => {
      try {
        await deleteUser(row.id);
        ElMessage.success('删除成功');
        if (users.value.length === 1 && page.value > 1) {
          page.value -= 1;
        }
        fetchUsers();
      } catch (err) {
        // 错误提示由 axios 拦截器统一处理
      }
    })
    .catch(() => {});
}

onMounted(fetchUsers);
</script>

<style scoped>
.search-input {
  width: 280px;
}

.table-card {
  padding: 8px 16px 16px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 4px 0;
}

.dialog-tip {
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .search-input {
    width: 100%;
  }
}
</style>
