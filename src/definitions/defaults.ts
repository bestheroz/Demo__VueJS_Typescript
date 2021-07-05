import {
  AuthorityItem,
  Code,
  Member,
  MemberConfig,
  Menu,
} from "@/definitions/models";
import dayjs from "dayjs";
import { AUTHORITY_ITEM_TYPE } from "@/definitions/selections";
import config from "../configs";

export function defaultUser(): {
  id: number;
  userId: string;
  name: string;
  authority: number;
} {
  return {
    id: 0,
    userId: "",
    name: "",
    authority: 0,
  };
}

export function defaultMemberConfig(): MemberConfig {
  return {
    globalTheme: config.theme.globalTheme as "light" | "dark",
    toolbarTheme: config.theme.toolbarTheme as "global" | "light" | "dark",
    menuTheme: config.theme.menuTheme as "global" | "light" | "dark",
    contentBoxed: config.theme.isContentBoxed,
    primaryColor: config.theme.light.primary,
  };
}

export function defaultMember(): Member {
  return {
    userId: "",
    name: "",
    loginFailCnt: 0,
    expired: dayjs().add(1, "years").endOf("day"),
    available: false,
    config: null,
    authority: null,
    token: "",
  };
}

export function defaultMenu(): Menu {
  return {
    name: "",
    type: "G",
    parentId: null,
    displayOrder: 0,
    icon: null,
    url: null,
  };
}
export function defaultCode(): Code {
  return {
    type: "",
    value: "",
    name: "",
    available: false,
    displayOrder: null,
  };
}
export function defaultAuthorityItem(): AuthorityItem {
  return {
    menu: defaultMenu(),
    authority: "",
    displayOrder: 0,
    typesJson: [AUTHORITY_ITEM_TYPE.VIEW],
  };
}
