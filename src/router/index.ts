import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/login.vue";
import Dashboard from "@/views/dashboard/dashboard.vue";

export const routes = [
  {
    path: "/",
    redirect: "/index",
  },
  {
    name: "login",
    path: "/login",
    component: Login,
  },
  {
    name: "index",
    path: "/index",
    component: () => import("@/views/index.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "/dashboard",
        component: Dashboard,
        name: "dashboard",
      },
      {
        path: "/followTrend",
        component: () => import("@/views/follow-trend/follow-trend.vue"),
        name: "followTrend",
      },
      {
        path: "/notice",
        component: () => import("@/views/message/index.vue"),
        name: "notice",
      },
      {
        path: "/user",
        component: () => import("@/views/user/index.vue"),
        name: "user",
      },
      {
        path: "/push",
        component: () => import("@/views/push/index.vue"),
        name: "push",
      },
      {
        path: "/search",
        component: () => import("@/views/search/index.vue"),
        name: "search",
      },
    ],
  },
];
const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
  routes,
});
router.beforeEach((_to, _from, next) => {
  next();
});
export default router;
