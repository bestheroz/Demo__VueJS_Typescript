<template>
  <div>
    <v-row v-if="fullWidth" no-gutters>
      <v-col cols="6">
        <DatetimePicker
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
          :max="max"
          full-width
          start-type
        />
      </v-col>
      <v-col cols="6">
        <DatetimePicker
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
          :min="min"
          full-width
          end-type
        />
      </v-col>
    </v-row>
    <v-row v-else no-gutters>
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
          :max="max"
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
          :min="min"
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
import { computed } from "vue";
import { useVModels } from "@vueuse/core";
import envs from "@/constants/envs";
import { isValidDateFormat } from "@/utils/formatter";

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

const DATETIMEPICKER_FORMAT = computed((): string =>
  props.useSeconds
    ? envs.DATETIME_FORMAT_STRING
    : envs.DATETIME_MINUTE_FORMAT_STRING,
);

const min = computed((): string =>
  isValidDateFormat(start.value)
    ? dayjs(start.value).format(DATETIMEPICKER_FORMAT.value)
    : "",
);

const max = computed((): string =>
  isValidDateFormat(end.value)
    ? dayjs(end.value).format(DATETIMEPICKER_FORMAT.value)
    : "",
);
</script>
