<template>
  <div>
    <v-row no-gutters v-if="fullWidth">
      <v-col cols="6">
        <DatetimePicker
          ref="refStart"
          v-model="start"
          :label="startLabel"
          :placeholder="startPlaceholder"
          :message="startMessage"
          :required="required"
          :disabled="disabled || startDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :clearable="clearable"
          :hide-hint="hideHint"
          :hide-label="hideLabel"
          :use-seconds="useSeconds"
          :max="maxDate"
          full-width
          start-type
        />
      </v-col>
      <v-col cols="6">
        <DatetimePicker
          ref="refEnd"
          v-model="end"
          :label="endLabel"
          :placeholder="endPlaceholder"
          :message="endMessage"
          :required="required"
          :disabled="disabled || endDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :clearable="clearable"
          :hide-hint="hideHint"
          :hide-label="hideLabel"
          :use-seconds="useSeconds"
          :min="minDate"
          full-width
          end-type
        />
      </v-col>
    </v-row>
    <v-row no-gutters v-else>
      <v-col cols="12" style="display: inline-flex">
        <DatetimePicker
          ref="refStart"
          v-model="start"
          :label="startLabel"
          :placeholder="startPlaceholder"
          :message="startMessage"
          :required="required"
          :disabled="disabled || startDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :clearable="clearable"
          :hide-hint="hideHint"
          :hide-label="hideLabel"
          :use-minutes="useMinutes"
          :use-seconds="useSeconds"
          :max="maxDate"
          start-type
        />
        <DatetimePicker
          ref="refEnd"
          v-model="end"
          :label="endLabel"
          :placeholder="endPlaceholder"
          :message="endMessage"
          :required="required"
          :disabled="disabled || endDisabled"
          :dense="dense"
          :hide-details="hideDetails"
          :clearable="clearable"
          :hide-hint="hideHint"
          :hide-label="hideLabel"
          :use-minutes="useMinutes"
          :use-seconds="useSeconds"
          :min="minDate"
          end-type
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import DatetimePicker from "@/components/picker/DatetimePicker.vue";
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
    hideLabel?: boolean;
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
    clearable?: boolean;
    useMinutes?: boolean;
    useSeconds?: boolean;
    fullWidth?: boolean;
    hideHint?: boolean;
  }>(),
  {
    start: null,
    end: null,
    startLabel: "시작 시각",
    endLabel: "종료 시각",
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

const DATE_FORMAT = "YYYY-MM-DD";
const MINUTE_TIME_PICKER_FORMAT = "HH:mm";
const TIMEPICKER_FORMAT = "HH:mm:ss";

const minDate = computed((): string[] | undefined => {
  if (!start.value) {
    return undefined;
  }
  return [
    dayjs(start.value).format(DATE_FORMAT),
    props.useSeconds
      ? dayjs(start.value).format(TIMEPICKER_FORMAT)
      : dayjs(start.value).format(MINUTE_TIME_PICKER_FORMAT),
  ];
});

const maxDate = computed((): string[] | undefined => {
  if (!end.value) {
    return undefined;
  }
  return [
    dayjs(end.value).format(DATE_FORMAT),
    props.useSeconds
      ? dayjs(end.value).format(TIMEPICKER_FORMAT)
      : dayjs(end.value).format(MINUTE_TIME_PICKER_FORMAT),
  ];
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
