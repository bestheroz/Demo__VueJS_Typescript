import dayjs from "dayjs";

export type DateTime = dayjs.ConfigType;

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
  text: string;
  type: string;
  key?: string;
  icon?: string;
  link?: string;
  value?: string;
  exact?: boolean;
  regex?: RegExp;
  disabled?: boolean;
  items?: Drawer[];
}

export interface FilterItem {
  text: string;
  chipText?: string | number | boolean | null;
  value: string | number | boolean;
  checked: boolean;
}

export interface Filter {
  type: "checkbox" | "text" | "dateStartEndPicker";
  text: string;
  key: string;
  items: FilterItem[];
  disabled?: boolean;
  single?: boolean;
  required?: boolean;
}
