import store from "@/stores";
import type { DateTime, SelectItem } from "@/definitions/types";
import dayjs from "dayjs";
import { truncate } from "lodash-es";
import { useCodesStore } from "@/stores/codes";
import { storeToRefs } from "pinia";
import envs from "@/constants/envs";

const { adminCodes } = storeToRefs(useCodesStore(store));

export function getAdminNm(value: number | undefined | null): string {
  const find = adminCodes.value.find(
    (value1: SelectItem<number>) => value1.value === value,
  );
  return find?.text ?? value?.toString() ?? "-";
}

export function formatDatetime(value: DateTime): string {
  return isValidDateFormat(value)
    ? dayjs(value).format(envs.DATETIME_FORMAT_STRING)
    : "";
}

export function formatDatetimeMinute(value: DateTime): string {
  return isValidDateFormat(value)
    ? dayjs(value).format(envs.DATETIME_MINUTE_FORMAT_STRING)
    : "";
}

export function formatDate(value: DateTime): string {
  return isValidDateFormat(value)
    ? dayjs(value).format(envs.DATE_FORMAT_STRING)
    : "";
}

export function isValidDateFormat(value: DateTime): boolean {
  return !!value && dayjs(value).isValid();
}

export function getEllipseText(
  value: string | null | undefined,
  length: number,
): string {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return truncate(value, {
    length: length,
  });
}

export function getSwitchLabel(
  yn?: boolean,
  text = ["사용", "사용안함"],
): string {
  return yn ? text[0] : text[1];
}
