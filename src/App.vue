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

<script lang="ts">
import "@/scss/common.scss";
import { Component, Vue, Watch } from "vue-property-decorator";
import Vuetify from "@/plugins/vuetify";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SimpleLayout from "@/layouts/SimpleLayout.vue";
import envs from "@/constants/envs";
import { cloneDeep } from "lodash-es";

@Component({
  components: {
    DefaultLayout,
    SimpleLayout,
  },
})
export default class extends Vue {
  title: string | null = null;

  get isRouterLoaded(): boolean {
    return this.$route.name !== null;
  }

  get currentLayout(): string {
    return (this.$route.meta.layout || "default") + "Layout";
  }

  protected async mounted(): Promise<void> {
    cloneDeep("");
    document.title = envs.PRODUCT_TITLE;
  }

  @Watch("$store.getters.primaryColor", { immediate: true })
  watchPrimaryColor(val: string): void {
    Vuetify.framework.theme.themes.dark.primary = val;
    Vuetify.framework.theme.themes.light.primary = val;
  }
}
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
