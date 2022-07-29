import { computed, reactive, toRefs } from "vue";
import { FilterOutput, Pagination } from "@/definitions/types";
import qs from "qs";
import useList from "@/composition/useList";
import { watchDebounced } from "@vueuse/core";

export default function <T>(
  pagination = {
    page: 1,
    sortBy: ["id"],
    sortDesc: [true],
    itemsPerPage: 10,
  } as Pagination,
) {
  const { items, totalItems, loading } = useList<T>();

  const state = reactive({
    pagination: pagination,
    search: "",
    filterOutput: {} as FilterOutput,
  });
  const computes = {
    queryString: computed((): string =>
      qs.stringify({
        search: state.search,
        ...state.filterOutput,
        ...state.pagination,
      }),
    ),
  };
  watchDebounced(
    () => [state.search, state.filterOutput],
    () => {
      state.pagination.page = 1;
    },
  );
  return {
    items,
    totalItems,
    loading,
    ...toRefs(state),
    ...computes,
  };
}
