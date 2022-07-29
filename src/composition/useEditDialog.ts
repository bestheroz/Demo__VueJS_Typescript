import { postApi, putApi } from "@/utils/apis";
import { computed, reactive, toRefs } from "vue";
import { useVModel, useVModels } from "@vueuse/core";

export default function <T extends { id?: number }>(
  props: { value: T; dialog: boolean },
  emits: {
    (e: "created", v: T): void;
    (e: "updated", v: T): void;
    (e: "update:dialog", v: boolean): void;
    (e: "input", v: T): void;
  },
  url: string,
) {
  const value = useVModel(props, "value", emits, { eventName: "input" });
  const { dialog } = useVModels(props, emits);

  const state = reactive({
    url: url,
    loading: false,
  });
  const methods = {
    create: async (): Promise<void> => {
      state.loading = true;
      const response = await postApi<T>(state.url, value.value);
      state.loading = false;
      if (response.success) {
        dialog.value = false;
        emits("created", response.data);
      }
    },

    update: async (): Promise<void> => {
      state.loading = true;
      const response = await putApi<T>(
        `${state.url}${value.value.id}`,
        value.value,
      );
      state.loading = false;
      if (response.success) {
        dialog.value = false;
        emits("updated", response.data);
      }
    },
  };
  const computes = {
    isNew: computed((): boolean => !value.value.id),
  };
  return {
    dialog,
    ...toRefs(state),
    ...computes,
    ...methods,
    value,
  };
}
