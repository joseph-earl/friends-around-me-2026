import { createWebHashHistory, createRouter } from "vue-router";

import Home from "./pages/Home.vue";
import Results from "./pages/Results.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/results", component: Results },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});