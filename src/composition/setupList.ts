import {
  computed,
  reactive,
  toRefs,
  UnwrapRefSimple,
} from "@vue/composition-api";
import { debounce, DebouncedFunc } from "lodash-es";
import { getApi } from "@/utils/apis";

export default function <T>(url: string) {
  const state = reactive({
    url: url,
    items: [] as T[],
    totalItems: 0,
    loading: false,
  });
  const computes = {
    fetchList: computed(
      (): DebouncedFunc<() => Promise<void>> =>
        debounce(async () => {
          state.items = [];
          state.totalItems = 0;
          state.loading = true;
          const response = await getApi<UnwrapRefSimple<T>[]>(state.url);
          state.loading = false;
          state.items = response.data || ([] as UnwrapRefSimple<T>[]);
          state.totalItems = response.data?.length || 0;
        }, 200),
    ),
  };
  const methods = {
    getList: () => {
      computes.fetchList.value();
    },
    onCreated: (item: T): void => {
      state.items = [item as UnwrapRefSimple<T>, ...state.items];
      state.totalItems++;
    },

    onUpdated: (item: T): void => {
      state.items.splice(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        state.items.findIndex((_item) => _item.id === item.id),
        1,
        item as UnwrapRefSimple<T>,
      );
    },
  };

  return { ...toRefs(state), ...computes, ...methods };
}
