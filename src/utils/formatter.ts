import store from "@/stores";
import { DateTime, SelectItem } from "@/definitions/types";
import dayjs from "dayjs";
import { truncate } from "lodash-es";
import { useCodesStore } from "@/stores/codes";
import { storeToRefs } from "pinia";

const { adminCodes } = storeToRefs(useCodesStore(store));
export function getAdminNm(value: number | undefined | null): string {
  const find = adminCodes.value.find(
    (value1: SelectItem<number>) => value1.value === value,
  );
  return find?.text ?? value?.toString() ?? "-";
}

export function formatDatetime(value: DateTime | undefined | null): string {
  return value && dayjs(value).isValid()
    ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
    : "";
}

export function formatDate(value: DateTime | undefined | null): string {
  return value && dayjs(value).isValid()
    ? dayjs(value).format("YYYY-MM-DD")
    : "";
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
