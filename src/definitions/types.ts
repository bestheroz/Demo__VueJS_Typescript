import type { ConfigType } from "dayjs";

export type DateTime = ConfigType;

export interface SelectItem<T = string> {
  value: T;
  text: string;
}

export interface Pagination {
  page: number;
  sortBy: string[];
  sortDesc: boolean[];
  itemsPerPage: number; // -1 for All
}

export interface PageResult<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    unpaged: boolean;
  };
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  totalElements: number;
  totalPages: number;
}

export interface Drawer {
  id: number;
  name: string;
  type: string;
  icon: string | null;
  url: string | null;
  children: Drawer[] | null;
}

export type FilterItemType = string | number | boolean | DateTime;

export interface FilterItem<T> {
  text: string;
  chipText?: string | number | boolean | null;
  value: T;
  checked: boolean;
}

export interface Filter {
  type: string;
  text: string;
  key: string;
  items: FilterItem<FilterItemType>[];
  disabled?: boolean;
  single?: boolean;
  required?: boolean;
  object?: unknown;
  timerOption?: "minute" | "second";
}

export type FilterOutput = Record<string, (string | number | boolean)[]>;

export interface AvailableFlagDTO {
  availableFlag: boolean;
}
