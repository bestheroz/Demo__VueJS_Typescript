import type { DateTime } from "@/definitions/types";

export interface Id {
  id?: number;
}

export interface IdCreatedUpdated extends Id {
  createdBy?: number;
  created?: DateTime;
  updatedBy?: number;
  updated?: DateTime;
}

export interface AdminConfig {
  globalTheme: "light" | "dark";
  toolbarTheme: "global" | "light" | "dark";
  menuTheme: "global" | "light" | "dark";
  toolbarDetached: boolean;
  contentBoxed: boolean;
  primaryColor: string;
}

export interface Menu extends IdCreatedUpdated {
  name: string;
  type: string;
  icon: string | null;
  url: string | null;
  children: Menu[];
}

export interface Code extends IdCreatedUpdated {
  type: string;
  value: string;
  text: string;
  availableFlag: boolean;
  displayOrder: number | null;
}

export interface RoleMenuMap {
  id?: number;
  menu: Menu;
  authoritiesJson: string[];
  children: RoleMenuMap[];
}

export interface Role extends IdCreatedUpdated {
  name: string;
  availableFlag: boolean;
  children: Role[];
  maps: RoleMenuMap[];
}

export interface Admin extends IdCreatedUpdated {
  loginId: string;
  name: string;
  expired: DateTime;
  availableFlag: boolean;
  role: Role;
}
export interface UpdateDisplayOrder {
  id: number;
  displayOrder: number;
}
