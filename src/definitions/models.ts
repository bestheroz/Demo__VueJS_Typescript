import { DateTime } from "@/definitions/types";

export interface MemberConfig {
  id?: number;
  createdBy?: string;
  created?: DateTime;
  updatedBy?: string;
  updated?: DateTime;
  globalTheme: "light" | "dark";
  toolbarTheme: "global" | "light" | "dark";
  menuTheme: "global" | "light" | "dark";
  contentBoxed: boolean;
  primaryColor: string;
}
export interface Member {
  id?: number;
  createdBy?: string;
  created?: DateTime;
  updatedBy?: string;
  updated?: DateTime;
  userId: string;
  password?: string;
  name: string;
  loginFailCnt: number;
  expired: DateTime;
  available: boolean;
  authority: number | null;
  token: string;
  config: MemberConfig | null;
}

export interface Menu {
  id?: number;
  createdBy?: string;
  created?: DateTime;
  updatedBy?: string;
  updated?: DateTime;
  name: string;
  type: string;
  parentId: number | null;
  displayOrder: number;
  icon: string | null;
  url: string | null;
}

export interface AuthorityItem {
  id?: number | null;
  authority: string;
  displayOrder: number;
  menu: Menu;
  typesJson: string[];
}

export interface Code {
  id?: number;
  createdBy?: string;
  created?: DateTime;
  updatedBy?: string;
  updated?: DateTime;
  type: string;
  value: string;
  name: string;
  available: boolean;
  displayOrder: number | null;
}
