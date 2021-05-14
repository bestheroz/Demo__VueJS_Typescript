import router from "@/router";
import axios from "axios";
import envs from "@/constants/envs";
import { goErrorPage } from "@/utils/errors";
import { ApiDataResult, axiosInstance, getApi } from "@/utils/apis";
import { MemberConfig } from "@/definitions/models";
import { SelectItem } from "@/definitions/types";
import _ from "lodash";

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

const uploadConfigHandler = _.debounce((config: MemberConfig) => {
  try {
    axiosInstance
      .post<ApiDataResult<MemberConfig>>("/api/members/mine/config/", config)
      .then();
  } catch (e) {
    console.error(e);
  }
}, 1000);
export function uploadConfig(config: MemberConfig): void {
  uploadConfigHandler(config);
}

export async function getYourConfig(): Promise<MemberConfig> {
  const response = await axiosInstance.get(
    `${envs.API_HOST}api/members/mine/config`,
  );
  return response.data.data;
}

export async function getMemberCodes(): Promise<SelectItem[] | undefined> {
  const response = await getApi<SelectItem[]>("members/codes");
  return response.data;
}

export function logout(): void {
  try {
    axiosInstance.delete(`${envs.API_HOST}api/auth/logout`).then();
  } catch (e) {
    console.error(e);
  }
  router.replace("/login").then();
}
