import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';

// 按需加载（懒加载）路由组件
const Home = () => import('@/views/Home/index.vue');
const UniAppCommunicator = () => import('@/views/UniAppCommunicator.vue');

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      keepAlive: true,
    },
  },
  {
    path: '/uniapp-communicator',
    name: 'UniAppCommunicator',
    component: UniAppCommunicator,
    meta: {
      title: 'UniApp调用能力',
      keepAlive: false,
    },
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在',
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 路由前置守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  next();
});

export default router;
