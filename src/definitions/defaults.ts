import {
  Authority,
  AuthorityItem,
  Code,
  CodeAuthority,
  Member,
  MemberConfig,
  Menu,
} from "@/definitions/models";
import dayjs from "dayjs";
import { AUTHORITY_TYPE } from "@/definitions/selections";
import config from "@/configs";

export function defaultUser(): {
  id: number;
  userId: string;
  name: string;
  authorityId: number;
} {
  return {
    id: 0,
    userId: "",
    name: "",
    authorityId: 0,
  };
}

export function defaultMemberConfig(): MemberConfig {
  return {
    globalTheme: config.theme.globalTheme as "light" | "dark",
    toolbarTheme: config.theme.toolbarTheme as "global" | "light" | "dark",
    menuTheme: config.theme.menuTheme as "global" | "light" | "dark",
    toolbarDetached: config.theme.isToolbarDetached,
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
    authorityId: 0,
    token: "",
  };
}

export function defaultMenu(): Menu {
  return {
    name: "",
    type: "G",
    parentId: 99999,
    displayOrder: 99999,
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
    displayOrder: 0,
    authorities: [],
  };
}
export function defaultAuthorityItem(): AuthorityItem {
  return {
    menu: defaultMenu(),
    displayOrder: 0,
    typesJson: [AUTHORITY_TYPE.VIEW],
  };
}
export function defaultAuthority(): Authority {
  return {
    code: "",
    name: "",
    items: [],
  };
}
export function defaultCodeAuthority(): CodeAuthority {
  return {
    authorityId: 0,
  };
}
