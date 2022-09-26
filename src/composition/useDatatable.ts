import { computed, reactive, toRefs } from "vue";
import type { FilterOutput, Pagination } from "@/definitions/types";
import qs from "qs";
import useList from "@/composition/useList";
import { watchDebounced } from "@vueuse/core";
import type { Id } from "@/definitions/models";

export default function <T extends Id>(
  url?: string,
  pagination = {
    page: 1,
    sortBy: ["id"],
    sortDesc: [true],
    itemsPerPage: 10,
  } as Pagination,
) {
  const {
    items,
    totalItems,
    loading,
    availableFlagSwitchLoadingMarker,
    patchAvailableFlag,
  } = useList<T>(url);

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
    availableFlagSwitchLoadingMarker,
    patchAvailableFlag,
    ...toRefs(state),
    ...computes,
  };
}
