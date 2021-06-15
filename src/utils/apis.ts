import axios, { AxiosError, AxiosResponse } from "axios";
import envs from "@/constants/envs";
import { goErrorPage } from "@/utils/errors";
import store from "@/store";
import { toastError, toastSuccess } from "@/utils/alerts";
import { goLoginPage } from "@/utils/commands";

export const axiosInstance = axios.create({
  baseURL: envs.API_HOST,
  headers: {
    contentType: "application/json",
  },
});

const defaultApiDataResultError = () => {
  return {
    code: "FFFF",
    data: null,
    message: "Unknown error",
  };
};

const onRejected = async (error: AxiosError) => {
  if (error?.message === "Network Error") {
    toastError("Service Unavailable");
    return;
  }
  if (error?.response) {
    if (error.response.headers.refreshtoken === "must") {
      const refreshToken = await apiRefreshToken(error);
      return refreshToken && axios.request(refreshToken.config);
    }
    if ([400, 401].includes(error.response?.status)) {
      await goLoginPage();
      return;
    } else if ([403, 404, 500].includes(error.response.status)) {
      await goErrorPage(error.response.status);
      return;
    }
  }
  if (process.env.NODE_ENV === "development") {
    alertAxiosError(error);
  }
  console.error(error);
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(
  function (config) {
    config.headers.Authorization = store.getters.accessToken;
    return config;
  },
  function (error) {
    alertAxiosError(error);
    return Promise.reject(error);
  },
);
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => onRejected(error),
);

export interface ApiDataResult<T> {
  code: string;
  data?: T | null;
  message: string;
  paginationTotalLength?: number;
}

export async function getApi<T>(url: string): Promise<ApiDataResult<T | null>> {
  const response = await axiosInstance.get<ApiDataResult<T>>(`api/${url}`);
  if (response) {
    return response.data;
  } else {
    toastError("Unknown error");
    return defaultApiDataResultError();
  }
}

function alertResponseMessage(data: ApiDataResult<unknown>): void {
  if (data.code.startsWith("S")) {
    toastSuccess(data.message);
  } else {
    console.error(data.message);
    toastError(data.message);
  }
}

function getResultData<T>(
  response: AxiosResponse<ApiDataResult<T>>,
  alert: boolean,
): ApiDataResult<T> {
  if (response) {
    if (alert) {
      alertResponseMessage(response.data);
    }
    return response.data;
  } else {
    toastError("Unknown error");
    return defaultApiDataResultError();
  }
}

export async function postApi<T>(
  url: string,
  data: T,
  alert = true,
): Promise<ApiDataResult<T>> {
  const response = await axiosInstance.post<ApiDataResult<T>>(
    `api/${url}`,
    data,
  );
  return getResultData(response, alert);
}

export async function putApi<T>(
  url: string,
  data: T,
  alert = true,
): Promise<ApiDataResult<T>> {
  const response = await axiosInstance.put<ApiDataResult<T>>(
    `api/${url}`,
    data,
  );
  return getResultData(response, alert);
}

export async function patchApi<T>(
  url: string,
  data: T,
  alert = true,
): Promise<ApiDataResult<T>> {
  const response = await axiosInstance.patch<ApiDataResult<T>>(
    `api/${url}`,
    data,
  );
  return getResultData(response, alert);
}

export async function deleteApi<T>(
  url: string,
  alert = true,
): Promise<ApiDataResult<T>> {
  const response = await axiosInstance.delete(`api/${url}`);
  return getResultData(response, alert);
}

export async function getCodesApi<SelectItem>(
  type: string,
): Promise<SelectItem[]> {
  const item = window.localStorage.getItem(`code__${type}`);
  if (item) {
    return JSON.parse(item);
  } else {
    try {
      const response = await axiosInstance.get<ApiDataResult<SelectItem[]>>(
        `api/codes/?type=${type}`,
      );
      if (response) {
        const result = response?.data?.data || [];
        if (result.length > 0) {
          window.localStorage.setItem(`code__${type}`, JSON.stringify(result));
        }
        return result;
      } else {
        toastError("Unknown error");
        return [];
      }
    } catch (error) {
      toastError(error.message);
      console.error(error.message);
      return [];
    }
  }
}

const axiosInstanceForExcel = axios.create({
  baseURL: envs.API_HOST,
  responseType: "blob",
  headers: {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
});

axiosInstanceForExcel.interceptors.request.use(
  function (config) {
    config.headers.Authorization = store.getters.accessToken;
    return config;
  },
  function (error) {
    alertAxiosError(error);
    return Promise.reject(error);
  },
);

axiosInstanceForExcel.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => onRejected(error),
);

export async function getFileApi(url: string): Promise<void> {
  const response = await axiosInstanceForExcel.get<Blob>(`api/${url}`);
  const newUrl = window.URL.createObjectURL(
    new Blob([response?.data], { type: response.headers["content-type"] }),
  );
  const tempLink = document.createElement("a");
  tempLink.style.display = "none";
  tempLink.href = newUrl;
  tempLink.setAttribute(
    "download",
    response.headers["content-disposition"]
      .split("=")
      .pop()
      .split(";")
      .join("")
      // eslint-disable-next-line
      .split('"')
      .join(""),
  );
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  window.URL.revokeObjectURL(newUrl);
}

async function apiRefreshToken(error: AxiosError) {
  try {
    await store.dispatch("reIssueAccessToken");
  } catch (e) {
    console.error(e);
    await goLoginPage();
    return;
  }
  error.config.headers.Authorization = store.getters.accessToken;
  error.config.headers.AuthorizationR = store.getters.refreshToken;
  return error;
}

export function alertAxiosError(e: AxiosError): void {
  e.response && toastError(e?.response?.data?.message || "System Error");
}
