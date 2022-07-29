import { reactive, toRefs } from "vue";

export default function <T>() {
  const state = reactive({
    items: [] as T[],
    totalItems: 0,
    loading: false,
  });
  return { ...toRefs(state) };
}
