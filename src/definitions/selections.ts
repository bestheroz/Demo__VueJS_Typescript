import type { SelectItem } from "@/definitions/types";

export const ROLE_AUTHORITY_TYPE = {
  WRITE: "WRITE",
  DELETE: "DELETE",
  VIEW: "VIEW",
  EXCEL: "EXCEL",
};
export const MENU_TYPE = {
  GROUP: "GROUP",
  PAGE: "PAGE",
  NEW_TAB: "NEW_TAB",
};
export const MenuTypes: SelectItem[] = [
  { value: MENU_TYPE.GROUP, text: "페이지 그룹" },
  { value: MENU_TYPE.PAGE, text: "페이지" },
  { value: MENU_TYPE.NEW_TAB, text: "새탭" },
];
export const BooleanTypes: SelectItem<boolean>[] = [
  { value: true, text: "예" },
  { value: false, text: "아니요" },
];

export const FILTER_TYPE = {
  CHECKBOX: "CHECKBOX",
  TEXT: "TEXT",
  DATE_PICKER: "DATE_PICKER",
  DATE_RANGE_PICKER: "DATE_RANGE_PICKER",
  DATETIME_PICKER: "DATETIME_PICKER",
  DATETIME_RANGE_PICKER: "DATETIME_RANGE_PICKER",
  DATETIME_START_END_PICKER: "DATETIME_START_END_PICKER",
};
