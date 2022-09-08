<template>
  <div>
    <v-select
      v-model="value"
      :items="items"
      item-text="name"
      :label="label"
      :error-messages="errorMessages"
      :loading="loading"
      :clearable="clearable"
      return-object
      :class="required ? 'required' : undefined"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
import { getApi } from "@/utils/apis";
import type { Role } from "@/definitions/models";

import { onBeforeMount, ref } from "vue";
import { useVModel } from "@vueuse/core";
import { defaultRole } from "@/definitions/defaults";

const props = withDefaults(
  defineProps<{
    value: Role;
    errorMessages?: string[];
    label?: string;
    clearable?: boolean;
    required?: boolean;
    disabled?: boolean;
    paramAvailable?: boolean;
  }>(),
  { value: () => defaultRole(), errorMessages: undefined, label: "역할" },
);
const emits = defineEmits<{
  (e: "input", v: Role): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
const items = ref<Role[]>([]);
const loading = ref(false);
onBeforeMount(async () => {
  loading.value = true;
  const response = await getApi<Role[]>(
    `roles/selections/?availableFlag=${
      !props.disabled && props.paramAvailable !== undefined
        ? props.paramAvailable
        : ""
    }`,
  );
  items.value = response.data ?? [];
  loading.value = false;
});
</script>
