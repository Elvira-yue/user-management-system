import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';
import { getToken, clearAuth } from '../utils/auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.code === 0) {
      return body.data;
    }
    const message = (body && body.message) || '请求失败';
    ElMessage.error(message);
    return Promise.reject(new Error(message));
  },
  (error) => {
    const status = error.response && error.response.status;
    const body = error.response && error.response.data;
    const message = (body && body.message) || (status ? `请求失败（${status}）` : '网络异常，请检查后端服务是否启动');

    if (status === 401) {
      clearAuth();
      const current = router.currentRoute.value;
      if (current.name !== 'login') {
        router.replace({ name: 'login', query: { redirect: current.fullPath } });
      }
    }

    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default request;
