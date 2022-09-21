<template>
  <div>
    <v-row v-if="fullWidth" no-gutters>
      <v-col cols="6">
        <DatePicker
          ref="refStart"
          v-model="start"
          :label="startLabel"
          :placeholder="startPlaceholder"
          :message="startMessage"
          :required="required"
          :disabled="disabled || startDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :hide-label="hideLabel"
          :clearable="clearable"
          :hide-hint="hideHint"
          :max="maxDate"
          start-type
          full-width
        />
      </v-col>
      <v-col cols="6">
        <DatePicker
          ref="refEnd"
          v-model="end"
          :label="endLabel"
          :placeholder="endPlaceholder"
          :message="endMessage"
          :required="required"
          :disabled="disabled || endDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :hide-label="hideLabel"
          :clearable="clearable"
          :hide-hint="hideHint"
          :min="minDate"
          end-type
          full-width
        />
      </v-col>
    </v-row>
    <v-row v-else no-gutters>
      <v-col cols="12" style="display: inline-flex">
        <DatePicker
          ref="refStart"
          v-model="start"
          :label="startLabel"
          :placeholder="startPlaceholder"
          :message="startMessage"
          :required="required"
          :disabled="disabled || startDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :hide-label="hideLabel"
          :clearable="clearable"
          :hide-hint="hideHint"
          :max="maxDate"
          start-type
        />
        <DatePicker
          ref="refEnd"
          v-model="end"
          :label="endLabel"
          :placeholder="endPlaceholder"
          :message="endMessage"
          :required="required"
          :disabled="disabled || endDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :hide-label="hideLabel"
          :clearable="clearable"
          :hide-hint="hideHint"
          :min="minDate"
          end-type
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import DatePicker from "@/components/picker/DatePicker.vue";
import dayjs from "dayjs";
import { DateTime } from "@/definitions/types";
import { computed, ref } from "vue";
import { useVModels } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    start?: DateTime;
    end?: DateTime;
    startLabel?: string;
    endLabel?: string;
    startPlaceholder?: string;
    endPlaceholder?: string;
    startMessage?: string;
    endMessage?: string;
    required?: boolean;
    disabled?: boolean;
    startDisabled?: boolean;
    endDisabled?: boolean;
    dense?: boolean;
    hideDetails?: boolean;
    hideLabel?: boolean;
    clearable?: boolean;
    fullWidth?: boolean;
    hideHint?: boolean;
  }>(),
  {
    start: null,
    end: null,
    startLabel: "From",
    endLabel: "To",
    startPlaceholder: undefined,
    endPlaceholder: undefined,
    startMessage: undefined,
    endMessage: undefined,
  },
);

const emits = defineEmits<{
  (e: "update:start", v: DateTime): void;
  (e: "update:end", v: DateTime): void;
}>();
const { start, end } = useVModels(props, emits);

const DATEPICKER_FORMAT = "YYYY-MM-DD";

const minDate = computed((): string | undefined => {
  if (!start.value) {
    return undefined;
  }
  return dayjs(start.value).format(DATEPICKER_FORMAT);
});

const maxDate = computed((): string | undefined => {
  if (!end.value) {
    return undefined;
  }
  return dayjs(end.value).format(DATEPICKER_FORMAT);
});
async function validate(): Promise<boolean> {
  return (
    !!(await refStart.value?.validate()) && !!(await refEnd.value?.validate())
  );
}
const refStart = ref();
const refEnd = ref();

defineExpose({ validate });
</script>
