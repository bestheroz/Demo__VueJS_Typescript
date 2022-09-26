<template>
  <div class="d-flex flex-grow-1">
    <!-- Navigation -->
    <v-navigation-drawer
      v-model="drawer"
      app
      floating
      class="elevation-1"
      :right="$vuetify.rtl"
      :light="menuTheme === 'light'"
      :dark="menuTheme === 'dark'"
    >
      <!-- Navigation menu info -->
      <template #prepend>
        <div class="pa-2">
          <div
            class="text-h6 font-weight-bold primary--text"
            v-text="envs.PRODUCT_TITLE"
          />
          <div
            class="text-overline grey--text"
            style="text-transform: none"
            v-text="envs.PRODUCT_VERSION"
          />
        </div>
      </template>

      <!-- Navigation menu -->
      <NavMenu v-if="drawerList.length > 0" :drawers="drawerList" />
    </v-navigation-drawer>

    <!-- Toolbar -->
    <v-app-bar
      app
      :color="toolbarDetached ? 'surface' : undefined"
      :flat="toolbarDetached"
      :light="toolbarTheme === 'light'"
      :dark="toolbarTheme === 'dark'"
    >
      <v-card
        class="flex-grow-1 d-flex"
        :class="[toolbarDetached ? 'pa-1 mt-3 mx-1' : 'pa-0 ma-0']"
        :flat="!toolbarDetached"
      >
        <div class="d-flex flex-grow-1 align-center">
          <div class="d-flex flex-grow-1 align-center">
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

            <v-spacer class="d-none d-lg-block" />

            <v-spacer class="d-block d-sm-none" />

            <ToolbarAdmin />
            <h4 class="primary--text mt-1" v-text="name" />
          </div>
        </div>
      </v-card>
    </v-app-bar>

    <v-main>
      <v-container class="fill-height" :fluid="!contentBoxed">
        <v-layout>
          <slot />
          <input type="text" style="width: 0; height: 0" />
        </v-layout>
      </v-container>

      <v-footer app inset>
        <v-spacer />
        <div class="text-overline">
          <a
            class="text-decoration-none"
            href="https://github.com/bestheroz"
            target="_blank"
          >
            @bestheroz
          </a>
          <v-icon small color="pink"> mdi-heart </v-icon>
        </div>
      </v-footer>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import ToolbarAdmin from "../components/toolbar/ToolbarAdmin.vue";
import envs from "@/constants/envs";
import NavMenu from "@/components/navigation/NavMenu.vue";
import type { Drawer } from "@/definitions/types";
import { computed, onBeforeMount, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";
import { useConfigStore } from "@/stores/config";

const authorityStore = useAuthorityStore();
const { drawers } = storeToRefs(authorityStore);
const { reloadRole } = authorityStore;

const { name } = storeToRefs(useAdminStore());

const { toolbarTheme, menuTheme, toolbarDetached, contentBoxed } = storeToRefs(
  useConfigStore(),
);

const drawer = ref(true);

const drawerList = computed((): Drawer[] =>
  ["local", "sandbox"].includes(envs.ENVIRONMENT)
    ? drawers.value
    : drawers.value.filter((d: Drawer) => d.id !== 1),
);
onBeforeMount(async () => {
  if (drawers.value.length === 0) {
    await reloadRole();
  }
});
</script>
