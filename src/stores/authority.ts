import { defineStore } from "pinia";
import type { Drawer } from "@/definitions/types";
import type { Role, RoleMenuMap } from "@/definitions/models";
import { getApi } from "@/utils/apis";
import {
  getCurrentAuthority,
  getDrawersFromRoleMenuMaps,
  getFlatRoleMenuMaps,
} from "@/utils/commands";
import { ROLE_AUTHORITY_TYPE } from "@/definitions/selections";

export const useAuthorityStore = defineStore("authority", {
  state: () => {
    return {
      superAdminFlag: false,
      drawers: [] as Drawer[],
      flatAuthorities: [] as RoleMenuMap[],
      currentAuthority: {} as RoleMenuMap,
      writeAuthority: false,
      deleteAuthority: false,
      excelAuthority: false,
    };
  },
  getters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasWriteAuthority: (state: any): boolean => {
      return state.writeAuthority || state.superAdminFlag;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasDeleteAuthority: (state: any): boolean => {
      return state.deleteAuthority || state.superAdminFlag;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasExcelAuthority: (state: any): boolean => {
      return state.excelAuthority || state.superAdminFlag;
    },
  },
  actions: {
    async reloadRole(): Promise<void> {
      const response = await getApi<Role>("mine/role");
      response.data ? this.setRole(response.data) : this.clearAuthority();
    },
    setRole(role: Role): void {
      this.superAdminFlag = role?.id === 1;
      this.drawers = getDrawersFromRoleMenuMaps(role.maps);
      this.flatAuthorities = getFlatRoleMenuMaps(role.maps);
    },
    reloadCurrentAuthority(path: string): void {
      this.currentAuthority = getCurrentAuthority(path);
      const authoritiesJson = this.currentAuthority?.authoritiesJson ?? [];
      this.writeAuthority = authoritiesJson.includes(ROLE_AUTHORITY_TYPE.WRITE);
      this.deleteAuthority = authoritiesJson.includes(
        ROLE_AUTHORITY_TYPE.DELETE,
      );
      this.excelAuthority = authoritiesJson.includes(ROLE_AUTHORITY_TYPE.EXCEL);
    },
    clearAuthority(): void {
      this.$reset();
    },
  },
  persist: true,
});
