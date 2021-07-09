import Vue from "vue";
import Router, { RawLocation, Route } from "vue-router";
import { NavigationGuardNext } from "vue-router/types/router";
import store from "@/store";
import { goLoginPage } from "@/utils/commands";

Vue.use(Router);

const requireAuth =
  () => async (_to: Route, _from: Route, next: NavigationGuardNext) => {
    if (store.getters.loggedIn) {
      return next();
    }
    return goLoginPage();
  };

const routes = () => {
  const admin = [
    {
      path: "/admin/code",
      beforeEnter: requireAuth(),
      component: () => import("@/views/admin/code/CodePage.vue"),
    },
    {
      path: "/admin/menu",
      beforeEnter: requireAuth(),
      component: () => import("@/views/admin/menu/MenuPage.vue"),
    },
    {
      path: "/admin/authority",
      beforeEnter: requireAuth(),
      component: () => import("@/views/admin/authority/AuthorityPage.vue"),
    },
    {
      path: "/admin/member",
      beforeEnter: requireAuth(),
      component: () => import("@/views/admin/member/MemberPage.vue"),
    },
  ];
  const developer = [
    {
      path: "/developer/picker",
      beforeEnter: requireAuth(),
      component: () => import("@/views/developer/picker/PickerPage.vue"),
    },
  ];
  const error = [
    {
      path: "/error",
      component: () => import("@/views/error/Error500.vue"),
      meta: {
        layout: "simple",
      },
    },
    {
      name: "403 Forbidden",
      path: "/error/403",
      component: () => import("@/views/error/Error403.vue"),
      meta: {
        layout: "simple",
      },
    },
    {
      name: "404 Page not found",
      path: "/error/404",
      component: () => import("@/views/error/Error404.vue"),
      meta: {
        layout: "simple",
      },
    },
  ];

  return [
    {
      path: "/login",
      component: () => import("@/views/login/LoginPage.vue"),
      meta: {
        layout: "simple",
      },
    },
    {
      path: "/blank",
      beforeEnter: requireAuth(),
      component: () => import("@/views/BlankPage.vue"),
    },
    {
      path: "/",
      beforeEnter: requireAuth(),
      redirect: "/blank",
    },
    ...admin,
    ...developer,
    ...error,
    {
      path: "*",
      redirect: "/error",
    },
  ];
};

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  scrollBehavior(_to: Route, _from: Route, savedPosition) {
    return savedPosition || { x: 0, y: 0 };
  },
  routes: routes(),
});

const originalPush = router.push;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
router.push = function push(location: RawLocation, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject);
  }
  return originalPush
    .call<Router, [RawLocation], Promise<Route>>(this, location)
    .catch((err: unknown) => {
      if (Router.isNavigationFailure(err)) {
        // resolve err
        return err;
      }
      // rethrow error
      return Promise.reject(err);
    });
};

const originalReplace = router.replace;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
router.replace = function replace(location: RawLocation, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalReplace.call(this, location, onResolve, onReject);
  }
  return originalReplace
    .call<Router, [RawLocation], Promise<Route>>(this, location)
    .catch((err: unknown) => {
      if (Router.isNavigationFailure(err)) {
        // resolve err
        return err;
      }
      // rethrow error
      return Promise.reject(err);
    });
};

export default router;
