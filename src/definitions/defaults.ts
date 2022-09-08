import {
  Admin,
  AdminConfig,
  Code,
  Menu,
  Role,
  RoleMenuMap,
} from "@/definitions/models";
import dayjs from "dayjs";
import { MENU_TYPE, ROLE_AUTHORITY_TYPE } from "@/definitions/selections";
import config from "../configs";
import { FilterItem, FilterItemType } from "@/definitions/types";

export function defaultAdminConfig(): AdminConfig {
  return {
    globalTheme: config.theme.globalTheme as "light" | "dark",
    toolbarTheme: config.theme.toolbarTheme as "global" | "light" | "dark",
    menuTheme: config.theme.menuTheme as "global" | "light" | "dark",
    toolbarDetached: config.theme.isToolbarDetached,
    contentBoxed: config.theme.isContentBoxed,
    primaryColor: config.theme.light.primary,
  };
}

export function defaultAdmin(): Admin {
  return {
    loginId: "",
    name: "",
    expired: dayjs().add(1, "years").endOf("day"),
    availableFlag: false,
    role: defaultRole(),
  };
}

export function defaultMenu(): Menu {
  return {
    name: "",
    type: MENU_TYPE.GROUP,
    icon: null,
    url: null,
    children: [],
  };
}

export function defaultCode(): Code {
  return {
    type: "",
    value: "",
    text: "",
    availableFlag: false,
    displayOrder: null,
  };
}

export function defaultRole(): Role {
  return {
    name: "",
    availableFlag: false,
    children: [],
    maps: [],
  };
}

export function defaultRoleMenuMap(): RoleMenuMap {
  return {
    menu: defaultMenu(),
    authoritiesJson: [ROLE_AUTHORITY_TYPE.VIEW],
    children: [],
  };
}

export function defaultFilterItem(): FilterItem<FilterItemType> {
  return {
    text: "",
    value: undefined,
    checked: false,
  };
}
