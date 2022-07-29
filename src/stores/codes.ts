import { defineStore } from "pinia";
import { SelectItem } from "@/definitions/types";
import { getAdminCodes } from "@/utils/commands";

export const useCodesStore = defineStore("codes", {
  state: () => {
    return {
      adminCodes: [] as SelectItem<number>[],
    };
  },
  actions: {
    async reloadAdminCodes(): Promise<void> {
      const result = await getAdminCodes();
      this.$state.adminCodes = result ?? [];
    },
  },
  persist: true,
});
