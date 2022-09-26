import { defineStore } from "pinia";
import config from "@/configs";
import { defaultAdminConfig } from "@/definitions/defaults";
import type { AdminConfig } from "@/definitions/models";

export const useConfigStore = defineStore("config", {
  state: () => {
    return {
      globalTheme: config.theme.globalTheme as "light" | "dark",
      toolbarTheme: config.theme.toolbarTheme as "global" | "light" | "dark",
      menuTheme: config.theme.menuTheme as "global" | "light" | "dark",
      toolbarDetached: config.theme.isToolbarDetached,
      contentBoxed: config.theme.isContentBoxed,
      primaryColor: config.theme.light.primary,
    };
  },
  actions: {
    resetDefaultConfig() {
      this.$state = defaultAdminConfig();
    },
    setConfig(config: AdminConfig) {
      this.globalTheme = config.globalTheme;
      this.contentBoxed = config.contentBoxed;
      this.menuTheme = config.menuTheme;
      this.toolbarTheme = config.toolbarTheme;
      this.toolbarDetached = config.toolbarDetached;
      this.primaryColor = config.primaryColor;
    },
  },
  persist: true,
});
