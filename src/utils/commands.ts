import router from "@/router";
import axios from "axios";
import envs from "@/constants/envs";
import { ApiDataResult, axiosInstance, deleteApi, getApi } from "@/utils/apis";
import { AdminConfig, RoleMenuMap } from "@/definitions/models";
import { Drawer, SelectItem } from "@/definitions/types";
import { defaultAdminConfig, defaultRoleMenuMap } from "@/definitions/defaults";
import { cloneDeep, debounce } from "lodash-es";
import store from "@/stores";
import { toastError } from "@/utils/alerts";
import dayjs from "dayjs";
import jwt_decode from "jwt-decode";
import { useAdminStore } from "@/stores/admin";
import { useAuthorityStore } from "@/stores/authority";
import { storeToRefs } from "pinia";

const { clearAdmin, reIssueAccessToken } = useAdminStore(store);
const { flatAuthorities } = storeToRefs(useAuthorityStore(store));

export async function routerReplace(path: string): Promise<void> {
  if (router.currentRoute.path !== path) {
    await router.replace(path);
  }
}

export async function routerPush(path: string): Promise<void> {
  if (router.currentRoute.path !== path) {
    await router.push(path);
  }
}

export async function goSignInPage(): Promise<void> {
  clearAdmin();
  await routerReplace("/sign-in");
}

export async function getNewToken(): Promise<
  | {
      accessToken: string;
      refreshToken: string;
    }
  | undefined
> {
  try {
    const response = await axios
      .create({
        baseURL: envs.API_HOST,
        headers: {
          contentType: "application/json",
          AuthorizationR: await getValidatedRefreshToken(),
        },
      })
      .get<
        ApiDataResult<{
          accessToken: string;
          refreshToken: string;
        }>
      >("api/sign-in/refresh-token");
    return response.data.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const statusCode = e.response?.status || 500;
      if (statusCode === 401 || e.message === "Invalid token specified!") {
        await goSignInPage();
      } else if ([403, 404, 500].includes(statusCode)) {
        toastError(e.message);
      } else {
        console.warn(`Missing Status Code: ${statusCode}`);
        toastError(e.message);
      }
    } else {
      console.error(e);
    }
  }
}

const uploadConfigHandler = debounce((config: AdminConfig) => {
  try {
    axiosInstance
      .post<AdminConfig, ApiDataResult<AdminConfig>>("api/mine/config", config)
      .then();
  } catch (e) {
    console.error(e);
  }
}, 1000);

export function uploadConfig(config: AdminConfig): void {
  uploadConfigHandler(config);
}

export async function getYourConfig(): Promise<AdminConfig> {
  const response = await getApi<AdminConfig>("mine/config");
  return response.data.primaryColor ? response.data : defaultAdminConfig();
}

export async function getAdminCodes(): Promise<SelectItem<number>[]> {
  const response = await getApi<SelectItem<number>[]>("admins/codes/");
  return response.data;
}

export async function signOut(): Promise<void> {
  try {
    await deleteApi("sign-out", false);
  } catch (e) {
    console.error(e);
  }
  await goSignInPage();
}

export function getCurrentAuthority(
  path = router.currentRoute.fullPath,
): RoleMenuMap {
  return (
    flatAuthorities.value.find(
      (roleMenuMap: RoleMenuMap) => roleMenuMap.menu.url === path,
    ) ?? defaultRoleMenuMap()
  );
}

export function getDrawersFromRoleMenuMaps(
  roleMenuMaps: RoleMenuMap[],
): Drawer[] {
  return (roleMenuMaps ?? []).map((roleMenuMap) => {
    return {
      id: roleMenuMap.menu.id || 0,
      name: roleMenuMap.menu.name,
      type: roleMenuMap.menu.type,
      icon: roleMenuMap.menu.icon,
      url: roleMenuMap.menu.url,
      children: getDrawersFromRoleMenuMaps(roleMenuMap.children ?? []),
    };
  });
}

export function getFlatRoleMenuMaps(
  roleMenuMaps: RoleMenuMap[],
): RoleMenuMap[] {
  if (!roleMenuMaps || roleMenuMaps.length === 0) {
    return [];
  }
  const cloneRoleMenuMaps = cloneDeep(roleMenuMaps);
  let result: RoleMenuMap[] = [];
  for (const roleMenuMap of cloneRoleMenuMaps) {
    if ((roleMenuMap.children ?? []).length > 0) {
      result = [...result, ...getFlatRoleMenuMaps(roleMenuMap.children ?? [])];
      roleMenuMap.children = [];
    }
    result = [...result, roleMenuMap];
  }
  return result;
}

export async function getValidatedAccessToken(): Promise<string> {
  let accessToken = window.localStorage.getItem("accessToken");
  if (!accessToken) {
    await goSignInPage();
    return "";
  }

  try {
    if (
      dayjs((jwt_decode(accessToken) as { exp: number }).exp * 1000).isBefore(
        dayjs(),
      )
    ) {
      await reIssueAccessToken();
      accessToken = window.localStorage.getItem("accessToken");
    }
  } catch (e: unknown) {
    await signOut();
  }
  return accessToken ?? "";
}

export async function getValidatedRefreshToken(): Promise<string> {
  const refreshToken = window.localStorage.getItem("refreshToken");
  if (
    !refreshToken ||
    dayjs((jwt_decode(refreshToken) as { exp: number }).exp * 1000).isBefore(
      dayjs(),
    )
  ) {
    await goSignInPage();
  }
  return refreshToken ?? "";
}
