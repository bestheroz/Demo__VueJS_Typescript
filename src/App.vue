<template>
  <transition name="fade" mode="out-in">
    <router-view />
  </transition>
</template>

<script lang="ts">
import "@/scss/common.scss";
import { Component, Vue, Watch } from "vue-property-decorator";
import { getVariableApi } from "@/utils/apis";

@Component({ name: "App" })
export default class extends Vue {
  protected async mounted(): Promise<void> {
    document.title = (await getVariableApi("title")) || "";
  }

  @Watch("$store.getters.theme", { immediate: true })
  watchTheme(val: string): void {
    this.$vuetify.theme.dark = val === "dark";
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
