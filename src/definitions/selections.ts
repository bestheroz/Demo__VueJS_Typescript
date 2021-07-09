import { SelectItem } from "@/definitions/types";

export const AUTHORITY_ITEM_TYPE = {
  WRITE: "WRITE",
  DELETE: "DELETE",
  VIEW: "VIEW",
};
export const AUTHORITY_TYPE = {
  SUPER: "SUPER",
  ADMIN: "ADMIN",
  WRITER: "WRITER",
  VIEWER: "VIEWER",
};
export const AuthorityTypes: SelectItem[] = [
  { value: AUTHORITY_TYPE.ADMIN, text: "관리자 권한" },
  { value: AUTHORITY_TYPE.WRITER, text: "쓰기 권한" },
  { value: AUTHORITY_TYPE.VIEWER, text: "보기 권한" },
];
export const MENU_TYPE = {
  G: "G",
  P: "P",
  W: "W",
};
export const MenuTypes: SelectItem[] = [
  { value: MENU_TYPE.G, text: "페이지 그룹" },
  { value: MENU_TYPE.P, text: "페이지" },
  { value: MENU_TYPE.W, text: "팝업" },
];
export const BooleanTypes: SelectItem<boolean>[] = [
  { value: true, text: "예" },
  { value: false, text: "아니요" },
];
