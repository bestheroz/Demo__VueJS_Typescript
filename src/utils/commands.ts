import router from "@/router";
import axios from "axios";
import envs from "@/constants/envs";
import { goErrorPage } from "@/utils/errors";
import { deleteApi, getApi, postApi } from "@/utils/apis";
import { AuthorityItem, MemberConfig } from "@/definitions/models";
import { SelectItem } from "@/definitions/types";
import { debounce } from "lodash-es";
import { defaultMemberConfig } from "@/definitions/defaults";
import store from "@/store";

export async function goLoginPage(): Promise<void> {
  if (router.currentRoute.path !== "/login") {
    await router.replace("/login");
  }
}

export async function getAccessToken(
  accessToken: string,
  refreshToken: string,
): Promise<string | undefined> {
  try {
    const response = await axios
      .create({
        baseURL: envs.API_HOST,
        headers: {
          contentType: "application/json",
          Authorization: accessToken,
          AuthorizationR: refreshToken,
        },
      })
      .get("api/auth/refreshToken");
    return response.data.data;
  } catch (e) {
    if (e.response?.status === 401 || e.message === "Invalid token specified") {
      await goLoginPage();
    } else if ([403, 404, 500].includes(e.response?.status)) {
      await goErrorPage(e.response?.status);
    } else {
      await goErrorPage(500);
    }
  }
}

const uploadConfigHandler = debounce((config: MemberConfig) => {
  try {
    postApi<MemberConfig>("members/mine/config/", config, false).then();
  } catch (e) {
    console.error(e);
  }
}, 1000);
export function uploadConfig(config: MemberConfig): void {
  uploadConfigHandler(config);
}

export async function getYourConfig(): Promise<MemberConfig> {
  const response = await getApi<MemberConfig>("members/mine/config");
  return response.data || defaultMemberConfig();
}

export async function getMemberCodes(): Promise<SelectItem[]> {
  const response = await getApi<SelectItem[]>("members/codes");
  return response.data || [];
}

export function logout(): void {
  try {
    deleteApi("auth/logout", false).then();
  } catch (e) {
    console.error(e);
  }
  router.replace("/login").then();
}

export function hasAuthority(
  type: string,
  path = router.currentRoute.fullPath,
): boolean {
  if (store.getters.isSuperUser) {
    return true;
  }
  const find = store.getters.authority.find(
    (item: AuthorityItem) => item.menu.url === path,
  );
  return (find?.typesJson || []).includes(type);
}
