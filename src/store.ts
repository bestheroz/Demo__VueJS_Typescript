import Vue from "vue";
import Vuex, { ActionContext } from "vuex";
import createPersistedState from "vuex-persistedstate";
import { Drawer, SelectItem } from "@/definitions/types";
// eslint-disable-next-line camelcase
import jwt_decode from "jwt-decode";
import type { Authority, MemberConfig, Menu } from "@/definitions/models";
import { AuthorityItem } from "@/definitions/models";
import _ from "lodash";
import Vuetify from "./plugins/vuetify";
import { MENU_TYPE } from "@/definitions/selections";
import config from "./configs";
import { getAccessToken, getMemberCodes, uploadConfig } from "@/utils/commands";
import { defaultMemberConfig } from "@/definitions/defaults";
import { getApi } from "@/utils/apis";

Vue.use(Vuex);

/* eslint-disable @typescript-eslint/no-explicit-any */
const user = {
  state: {
    id: 0,
    userId: "",
    name: "",
    authorityId: 0,
    accessToken: null,
    refreshToken: null,
  },
  getters: {
    user: (state: any) => {
      return {
        id: state.id,
        userId: state.userId,
        name: state.name,
        authorityId: state.authorityId,
      };
    },
    loggedIn: (state: any): boolean => {
      return !!state.id && !!state.accessToken && !!state.refreshToken;
    },
    accessToken: (state: any): string | null => {
      return state.accessToken;
    },
    refreshToken: (state: any): string | null => {
      return state.refreshToken;
    },
  },
  mutations: {
    setAccessToken(state: any, accessToken: string): void {
      const jwt =
        jwt_decode<{
          exp: number;
          userId: string;
          userVO: string;
        }>(accessToken);
      const user = JSON.parse(jwt.userVO);
      state.id = user.id;
      state.userId = user.userId;
      state.name = user.name;
      state.authorityId = user.authorityId;
      state.accessToken = accessToken;
    },
    setRefreshToken(state: any, refreshToken: string): void {
      state.refreshToken = refreshToken;
    },
    setUser: (
      state: any,
      member: {
        id: number;
        userId: string;
        name: string;
        authorityId: number;
      },
    ) => {
      state.id = member.id;
      state.userId = member.userId;
      state.name = member.name;
      state.authorityId = member.authorityId;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
  actions: {
    saveToken(
      { commit }: ActionContext<any, any>,
      payload: { accessToken: string; refreshToken: string },
    ): void {
      commit("setAccessToken", payload.accessToken);
      commit("setRefreshToken", payload.refreshToken);
    },
    async reIssueAccessToken({
      commit,
      getters,
    }: ActionContext<any, any>): Promise<void> {
      await commit(
        "setAccessToken",
        await getAccessToken(getters.accessToken, getters.refreshToken),
      );
    },
  },
};

const config1 = {
  state: {
    globalTheme: config.theme.globalTheme as "light" | "dark",
    toolbarTheme: config.theme.toolbarTheme as "global" | "light" | "dark",
    menuTheme: config.theme.menuTheme as "global" | "light" | "dark",
    contentBoxed: config.theme.isContentBoxed,
    primaryColor: config.theme.light.primary,
  },
  getters: {
    config: (state: MemberConfig): MemberConfig => {
      return {
        ...state,
      };
    },
    globalTheme: (state: MemberConfig): "light" | "dark" => {
      Vuetify.framework.theme.dark = state.globalTheme === "dark";
      return state.globalTheme;
    },
    menuTheme: (state: MemberConfig): "global" | "light" | "dark" => {
      return state.menuTheme;
    },
    toolbarTheme: (state: MemberConfig): "global" | "light" | "dark" => {
      return state.toolbarTheme;
    },
    isContentBoxed: (state: MemberConfig): boolean => {
      return state.contentBoxed;
    },
    primaryColor: (state: MemberConfig): string => {
      return state.primaryColor;
    },
  },
  mutations: {
    setGlobalTheme: (state: MemberConfig, globalTheme: "light" | "dark") => {
      state.globalTheme = globalTheme;
    },
    setContentBoxed: (state: MemberConfig, isContentBoxed: boolean) => {
      state.contentBoxed = isContentBoxed;
    },
    setMenuTheme: (state: any, menuTheme: "global" | "light" | "dark") => {
      state.menuTheme = menuTheme;
    },
    setToolbarTheme: (
      state: MemberConfig,
      toolbarTheme: "global" | "light" | "dark",
    ) => {
      state.toolbarTheme = toolbarTheme;
    },
    setPrimaryColor: (state: MemberConfig, primaryColor: string) => {
      state.primaryColor = primaryColor;
    },
    setConfig: (state: MemberConfig, config: MemberConfig) => {
      state.globalTheme = config.globalTheme;
      state.contentBoxed = config.contentBoxed;
      state.menuTheme = config.menuTheme;
      state.toolbarTheme = config.toolbarTheme;
      state.primaryColor = config.primaryColor;
    },
  },
  actions: {
    setGlobalTheme: async (
      { commit, getters }: ActionContext<any, any>,
      globalTheme: "light" | "dark",
    ) => {
      commit("setGlobalTheme", globalTheme);
      uploadConfig(getters.config);
    },
    setContentBoxed: async (
      { commit, getters }: ActionContext<any, any>,
      isContentBoxed: boolean,
    ) => {
      commit("setContentBoxed", isContentBoxed);
      uploadConfig(getters.config);
    },
    setMenuTheme: async (
      { commit, getters }: ActionContext<any, any>,
      menuTheme: "global" | "light" | "dark",
    ) => {
      commit("setMenuTheme", menuTheme);
      uploadConfig(getters.config);
    },
    setToolbarTheme: async (
      { commit, getters }: ActionContext<any, any>,
      toolbarTheme: "global" | "light" | "dark",
    ) => {
      commit("setToolbarTheme", toolbarTheme);
      uploadConfig(getters.config);
    },
    setToolbarDetached: async (
      { commit, getters }: ActionContext<any, any>,
      isToolbarDetached: boolean,
    ) => {
      commit("setToolbarDetached", isToolbarDetached);
      uploadConfig(getters.config);
    },
    setPrimaryColor: async (
      { commit, getters }: ActionContext<any, any>,
      primaryColor: string,
    ) => {
      commit("setPrimaryColor", primaryColor);
      uploadConfig(getters.config);
    },
    resetConfig: ({ commit, getters }: ActionContext<any, any>) => {
      commit("setConfig", defaultMemberConfig());
      uploadConfig(getters.config);
    },
  },
};
const authority = {
  state: {
    code: "",
    name: "",
    items: [],
  },
  getters: {
    drawers: (state: any): Drawer[] => {
      if (!state.items || state.items.length === 0) {
        return [];
      }
      const drawers: Drawer[] = state.items
        .map((item: AuthorityItem) => item.menu)
        .map((m: Menu) => {
          return {
            text: m.name,
            type: m.type,
            icon: m.icon,
            link: m.url,
            exact: true,
          };
        });
      const groupItems: Drawer[] = drawers.filter((item: Drawer) => item.icon);
      const groupIndex = groupItems.map((group: Drawer) =>
        drawers.indexOf(group),
      );
      if (!groupIndex || groupIndex.length === 0) {
        return [
          {
            text: "",
            type: MENU_TYPE.G,
            items: drawers,
          },
        ];
      } else {
        return [
          {
            text: "",
            type: MENU_TYPE.G,
            items: [
              ..._.take(drawers, groupIndex[0]),
              ...groupItems.map((group: Drawer, index: number) => {
                let nextIndex;
                if (groupIndex.length > index + 1) {
                  nextIndex = groupIndex[index + 1];
                } else {
                  nextIndex = drawers.length;
                }
                const numberOfChildren = nextIndex - groupIndex[index] - 1;
                return {
                  ...group,
                  items: _.take(
                    _.drop(drawers, groupIndex[index] + 1),
                    numberOfChildren,
                  ),
                };
              }),
            ],
          },
        ];
      }
    },
  },
  mutations: {
    setAuthority(state: any, authority: Authority): void {
      state.code = authority.code;
      state.name = authority.name;
      state.items = authority.items;
    },
  },
  actions: {
    async resetAuthority({ commit }: ActionContext<any, any>): Promise<void> {
      const response = await getApi("members/mine/authority").then();
      commit("setAuthority", response.data);
    },
  },
};
const codes = {
  state: {
    memberCodes: null,
  },
  getters: {
    memberCodes: (state: any): SelectItem[] => {
      return state.memberCodes || [];
    },
  },
  mutations: {
    setMemberCodes(state: any, memberCodes: SelectItem[]): void {
      state.memberCodes = memberCodes;
    },
  },
  actions: {
    async resetMemberCodes({ commit }: ActionContext<any, any>): Promise<void> {
      commit("setMemberCodes", await getMemberCodes());
    },
  },
};
const etc = {
  state: {
    selectedMenuName: null,
  },
  getters: {
    selectedMenuName: (state: any): string => {
      return state.selectedMenuName?.split("(팝업)").join("") || "";
    },
  },
  mutations: {
    setSelectedMenu(state: any, menuName: string): void {
      state.selectedMenuName = menuName;
    },
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */
export default new Vuex.Store({
  strict: true,
  modules: {
    user,
    config1,
    authority,
    codes,
    etc,
  },
  plugins: [createPersistedState()],
});
