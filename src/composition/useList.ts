import { reactive, ref, toRefs } from "vue";
import type { Ref } from "vue";
import { patchApi } from "@/utils/apis";
import type { AvailableFlagDTO } from "@/definitions/types";
import type { Id } from "@/definitions/models";

export default function <T extends Id>(url?: string) {
  const state = reactive({
    totalItems: 0,
    loading: false,
    availableFlagSwitchLoadingMarker: [] as number[],
  });
  const items = ref<T[]>([]) as Ref<T[]>;
  const methods = {
    patchAvailableFlag: async (
      id: number | undefined,
      value: boolean,
    ): Promise<void> => {
      if (!url || !id || state.availableFlagSwitchLoadingMarker.includes(id)) {
        return;
      }
      state.availableFlagSwitchLoadingMarker = [
        ...state.availableFlagSwitchLoadingMarker,
        id,
      ];
      const result = await patchApi<AvailableFlagDTO, T>(
        `${url}${id}/available-flag`,
        {
          availableFlag: value,
        },
      );
      state.availableFlagSwitchLoadingMarker.splice(
        state.availableFlagSwitchLoadingMarker.findIndex((m) => m === id),
        1,
      );
      if (result.success) {
        items.value.splice(
          items.value.findIndex((item) => item.id === id),
          1,
          result.data,
        );
      }
    },
  };
  return { ...toRefs(state), items, ...methods };
}
