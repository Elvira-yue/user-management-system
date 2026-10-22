import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '../utils/auth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true, title: '注册' }
  },
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    redirect: '/users',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: 'user-list',
        component: () => import('../views/UserListView.vue'),
        meta: { requiresAuth: true, title: '用户列表' }
      },
      {
        path: 'users/:id',
        name: 'user-detail',
        component: () => import('../views/UserDetailView.vue'),
        meta: { requiresAuth: true, title: '用户详情' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/users'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：未登录访问管理页面时跳转登录页
router.beforeEach((to) => {
  const token = getToken();

  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && token) {
    return { name: 'user-list' };
  }

  document.title = to.meta.title ? `${to.meta.title} - 用户管理系统` : '用户管理系统';
  return true;
});

export default router;
