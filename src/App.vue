<template>
  <v-app>
    <!-- Layout component -->
    <component :is="currentLayout" v-if="isRouterLoaded">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </component>
  </v-app>
</template>

<script setup lang="ts">
import AuthLayout from "@/layouts/AuthLayout.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ErrorLayout from "@/layouts/ErrorLayout.vue";
import Vuetify from "@/plugins/vuetify";
import envs from "@/constants/envs";
import {
  getValidatedAccessToken,
  getValidatedRefreshToken,
} from "@/utils/commands";
import type { RoleMenuMap } from "@/definitions/models";
import { computed, onBeforeMount, onMounted, watch } from "vue";
import router from "@/router";
import { storeToRefs } from "pinia";
import { useAuthorityStore } from "@/stores/authority";
import { useConfigStore } from "@/stores/config";

const authorityStore = useAuthorityStore();
const { currentAuthority } = storeToRefs(authorityStore);
const { reloadCurrentAuthority } = authorityStore;

const { primaryColor, globalTheme } = storeToRefs(useConfigStore());

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
  error: ErrorLayout,
};

const isRouterLoaded = computed((): boolean => router.app.$route.name !== null);
const currentLayout = computed(
  () => layouts[router.app.$route.meta?.layout || "default"],
);

onBeforeMount(async () => {
  await getValidatedRefreshToken();
  await getValidatedAccessToken();
});

onMounted(() => {
  document.title = envs.PRODUCT_TITLE;
});

watch(
  () => router.app.$route.fullPath,
  (val: string) => {
    reloadCurrentAuthority(val);
  },
);
watch(
  () => currentAuthority.value,
  (val: RoleMenuMap) => {
    const pageTitle = val?.menu?.name;
    document.title = pageTitle
      ? `${envs.PRODUCT_TITLE}::${pageTitle}`
      : envs.PRODUCT_TITLE;
  },
  { immediate: true },
);
watch(
  () => primaryColor.value,
  (val: string) => {
    Vuetify.framework.theme.themes.dark.primary = val;
    Vuetify.framework.theme.themes.light.primary = val;
  },
  { immediate: true },
);
watch(
  () => globalTheme.value,
  (val: string) => {
    Vuetify.framework.theme.dark = val === "dark";
  },
  { immediate: true },
);
</script>
<style scoped>
/**
 * Transition animation between pages
 */
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
