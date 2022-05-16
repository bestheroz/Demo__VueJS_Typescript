import axios, { AxiosError, AxiosResponse } from "axios";
import envs from "@/constants/envs";
import store from "@/store";
import { toastError, toastSuccess } from "@/utils/alerts";
import {
  getValidatedAccessToken,
  getValidatedRefreshToken,
  goSignInPage,
} from "@/utils/commands";
import { Code } from "@/definitions/models";
import dayjs from "dayjs";
import jwt_decode from "jwt-decode";

export const axiosInstance = axios.create({
  baseURL: envs.API_HOST,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

axiosInstance.interceptors.request.use(
  async function (config) {
    if (!config.headers) {
      console.error("Failed to set 'request headers' : headers is not exist");
      return;
    }
    config.headers.Authorization = await getValidatedAccessToken();
    return config;
  },
  function (error) {
    alertAxiosError(error);
    return Promise.reject(error);
  },
);
axiosInstance.interceptors.response.use(
  function (response) {
    if (response?.data) {
      response.data.success =
        [200, 201].includes(response.status) &&
        response.data.code?.startsWith("S");
      return response;
    } else {
      console.error(response);
      return { data: { success: false, code: "E" } } as ApiDataResult;
    }
  },
  async function (error: AxiosError) {
    console.error(error.message);
    if (error.message === "Network Error") {
      toastError("Service Unavailable");
      return;
    }
    if (error.response) {
      if (error.response.headers.refreshtoken === "must") {
        const refreshToken = await apiRefreshToken(error);
        if (refreshToken?.config?.headers) {
          refreshToken.config.headers.Authorization =
            await getValidatedAccessToken();
          return axiosInstance.request(refreshToken.config);
        } else {
          return;
        }
      }
      if ([400, 401].includes(error.response.status)) {
        await goSignInPage();
        return;
      } else if ([403, 404, 500].includes(error.response.status)) {
        return { data: { success: false, code: "E" } } as ApiDataResult;
      }
    }
    if (process.env.NODE_ENV === "development") {
      alertAxiosError(error);
    }
    console.warn(error);
    return Promise.reject(error);
  },
);

export interface ApiDataResult<T = unknown> {
  code: string;
  data: T;
  message: string;
  success: boolean;
}

export async function getApi<T = never, R = T>(
  url: string,
  failAlert = true,
): Promise<ApiDataResult<R>> {
  const response = await axiosInstance.get<T, AxiosResponse<ApiDataResult<R>>>(
    `api/${url}`,
  );
  if (response?.data) {
    // accessToken 재발급시 success 값을 만들어줘야함.
    response.data.success =
      [200, 201].includes(response.status) &&
      response.data.code?.startsWith("S");
    if (!response.data.success && failAlert) {
      alertResponseMessage(response.data);
    }
  } else {
    console.error(response);
  }
  return response.data ?? { success: false, code: "E" };
}

export async function postApi<T = never, R = T>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  data: any,
  alert = true,
): Promise<ApiDataResult<R>> {
  const response = await axiosInstance.post<T, AxiosResponse<ApiDataResult<R>>>(
    `api/${url}`,
    data,
  );
  // response.status === 201
  if (alert) {
    alertResponseMessage(response.data);
  }
  return response.data;
}

export async function putApi<T = never, R = T>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  data: any,
  alert = true,
): Promise<ApiDataResult<R>> {
  const response = await axiosInstance.put<T, AxiosResponse<ApiDataResult<R>>>(
    `api/${url}`,
    data,
  );
  // response.status === 200
  if (alert) {
    alertResponseMessage(response.data);
  }
  return response.data;
}

export async function patchApi<T = never, R = T>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  data: any,
  alert = true,
): Promise<ApiDataResult<R>> {
  const response = await axiosInstance.patch<
    T,
    AxiosResponse<ApiDataResult<R>>
  >(`api/${url}`, data);
  // response.status === 200
  if (alert) {
    alertResponseMessage(response.data);
  }
  return response.data;
}

export async function deleteApi<T = never, R = T>(
  url: string,
  alert = true,
): Promise<ApiDataResult<R>> {
  const response = await axiosInstance.delete<
    T,
    AxiosResponse<ApiDataResult<R>>
  >(`api/${url}`);
  // response.status === 204
  if (alert) {
    alertResponseMessage(response.data);
  }
  return response.data;
}

export async function getCodesApi(type: string): Promise<Code[]> {
  const item = window.sessionStorage.getItem(`code__${type}`);
  if (item) {
    return JSON.parse(item);
  } else {
    try {
      const response = await axiosInstance.get<
        string,
        AxiosResponse<ApiDataResult<Code[]>>
      >(`api/v1/codes/?type=${type}&available=true`);
      const result = response.data.data || [];
      if (result.length > 0) {
        window.sessionStorage.setItem(`code__${type}`, JSON.stringify(result));
      }
      return result;
    } catch (error) {
      return [];
    }
  }
}

export async function getEnvironmentApi<T = string>(
  key: string,
): Promise<T | null> {
  const item = window.sessionStorage.getItem(`environment__${key}`);
  if (item) {
    return JSON.parse(item);
  } else {
    try {
      const response = await axiosInstance.get<
        T,
        AxiosResponse<ApiDataResult<T>>
      >(`api/v1/environments/${key}`);
      const result = response.data.data || null;
      if (result) {
        window.sessionStorage.setItem(
          `environment__${key}`,
          JSON.stringify(result),
        );
      }
      return result;
    } catch (error) {
      // console.warn(getErrorResult(error).message);
      return null;
    }
  }
}

function alertResponseMessage(data: ApiDataResult<unknown>): void {
  if (data.success || data.code.startsWith("S")) {
    toastSuccess(data.message);
  } else {
    data.message && toastError(data.message);
  }
}

export async function uploadFileApi<T = string>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
  formData: FormData,
  alert = false,
): Promise<ApiDataResult<T>> {
  const response = await axiosInstance.post<
    FormData,
    AxiosResponse<ApiDataResult<T>>
  >(`${envs.FILE_API_HOST}api/${url}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  // response.status === 201
  if (alert) {
    alertResponseMessage(response.data);
  }
  return response.data;
}

export async function downloadExcelApi(url: string): Promise<void> {
  const response = await axiosInstance.get<Blob>(`api/${url}`, {
    responseType: "blob",
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
  const newUrl = window.URL.createObjectURL(
    new Blob([response.data], { type: response.headers["content-type"] }),
  );
  const tempLink = document.createElement("a");
  tempLink.style.display = "none";
  tempLink.href = newUrl;
  const contentDisposition = response.headers["content-disposition"];
  tempLink.setAttribute(
    "download",
    (contentDisposition
      ? contentDisposition
          .split("=")
          .pop()
          ?.split(";")
          .join("")
          // eslint-disable-next-line
          .split('"')
          .join("")
      : url.split("/").pop()) || "",
  );
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  window.URL.revokeObjectURL(newUrl);
}

async function apiRefreshToken(error: AxiosError) {
  try {
    const refreshToken = window.localStorage.getItem("refreshToken");
    if (
      !refreshToken ||
      dayjs((jwt_decode(refreshToken) as { exp: number }).exp * 1000).isBefore(
        dayjs(),
      )
    ) {
      await goSignInPage();
    }
    await store.dispatch("reIssueAccessToken");
  } catch (e) {
    console.error(e);
    await goSignInPage();
    return;
  }
  if (!error.config.headers) {
    console.error("Failed to set 'request headers' : headers is not exist");
    return;
  }
  error.config.headers.AuthorizationR = await getValidatedRefreshToken();
  return error;
}

export function alertAxiosError(e: AxiosError): void {
  e.response && toastError(e.response.statusText || "System Error");
}
