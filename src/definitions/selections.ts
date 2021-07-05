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
export const MenuTypeItems: SelectItem[] = [
  { value: "G", text: "페이지 그룹" },
  { value: "P", text: "페이지" },
  { value: "W", text: "팝업" },
];
export const MENU_TYPE = {
  G: "G",
  P: "P",
  W: "W",
};
