import { defineStore } from "pinia";
import { getNewToken, signOut } from "@/utils/commands";
import jwt_decode from "jwt-decode";

export const useAdminStore = defineStore("admin", {
  state: () => {
    return {
      id: 0,
      loginId: "",
      name: "",
      roleId: 0,
      accessToken: null as string | null,
    };
  },
  getters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loggedIn: (state: any): boolean =>
      !!state.id &&
      !!state.accessToken &&
      !!window.localStorage.getItem("accessToken") &&
      !!window.localStorage.getItem("refreshToken"),
  },
  actions: {
    async reIssueAccessToken(): Promise<void> {
      const newToken = await getNewToken();
      if (newToken) {
        this.saveToken(newToken);
      }
    },
    clearAdmin(): void {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      this.$reset();
    },
    saveToken(payload: { accessToken: string; refreshToken: string }): void {
      try {
        const jwt = jwt_decode<{
          exp: number;
          id: number;
          loginId: string;
          name: string;
          roleId: string;
        }>(payload.accessToken);
        window.localStorage.setItem("accessToken", payload.accessToken);
        window.localStorage.setItem("refreshToken", payload.refreshToken);
        this.id = jwt.id;
        this.loginId = jwt.loginId;
        this.name = jwt.name;
        this.roleId = +jwt.roleId;
        this.accessToken = payload.accessToken;
      } catch (e: unknown) {
        signOut().then();
      }
    },
  },
  persist: true,
});
