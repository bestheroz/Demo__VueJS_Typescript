<template>
  <v-dialog
    ref="refDialog"
    v-model="dialog"
    :return-value.sync="datetimePicker"
    :width="470"
    @keydown.esc="dialog = false"
    @keydown.enter="save"
  >
    <template #activator="{ on }">
      <validation-provider
        v-slot="{ errors }"
        :name="hideLabel ? placeholder : label"
        :rules="required ? 'required' : ''"
      >
        <v-text-field
          :value="textFieldString"
          :label="hideLabel ? undefined : label"
          :placeholder="placeholder"
          :hint="hideHint ? undefined : hint"
          persistent-hint
          :messages="message"
          filled
          prepend-inner-icon="mdi-calendar-clock"
          readonly
          :disabled="disabled"
          :dense="dense"
          :hide-details="hideDetails"
          :clearable="clearable"
          :error-messages="errors"
          :append-outer-icon="startType ? 'mdi-tilde' : undefined"
          :class="classSet"
          :style="style"
          @click:prepend-inner="dialog = true"
          @click:clear="value = null"
          v-on="on"
        />
      </validation-provider>
    </template>
    <v-date-picker
      v-model="datePicker"
      :locale="envs.LOCALE"
      landscape
      reactive
      :max="maxDate"
      :min="minDate"
    />
    <v-time-picker
      ref="refTimePicker"
      v-model="timePicker"
      format="24hr"
      landscape
      :use-seconds="useSeconds"
      :max="maxTime"
      :min="minTime"
      @click:hour="selectingHourIfNoneTimerOption"
    >
      <v-btn filled :disabled="disableToday" @click="setNow"> 지금</v-btn>
      <div class="flex-grow-1" />
      <v-btn filled @click="dialog = false"> 취소</v-btn>
      <v-btn filled @click="save"> 확인</v-btn>
    </v-time-picker>
  </v-dialog>
</template>

<script setup lang="ts">
import envs from "@/constants/envs";
import dayjs from "dayjs";
import type { DateTime } from "@/definitions/types";
import { computed, nextTick, ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { formatDate, isValidDateFormat } from "@/utils/formatter";

const props = withDefaults(
  defineProps<{
    value: DateTime;
    label?: string;
    placeholder?: string;
    message?: string;
    required?: boolean;
    disabled?: boolean;
    dense?: boolean;
    hideDetails?: boolean;
    clearable?: boolean;
    useSeconds?: boolean;
    useMinutes?: boolean;
    startType?: boolean;
    endType?: boolean;
    fullWidth?: boolean;
    hideHint?: boolean;
    hideLabel?: boolean;
    max?: string;
    min?: string;
  }>(),
  {
    label: "날짜 선택",
    dense: true,
    placeholder: undefined,
    message: undefined,
    max: undefined,
    min: undefined,
  },
);

const emits = defineEmits<{
  (e: "input", value: DateTime): void;
}>();

const value = useVModel(props, "value", emits, { eventName: "input" });
const datetimePicker = ref<DateTime>(null);
const tempTimeValue = ref<DateTime>(null);
const TIMEPICKER_FORMAT = computed((): string =>
  props.useSeconds ? envs.TIME_FORMAT_STRING : envs.TIME_MINUTE_FORMAT_STRING,
);
const textFieldString = computed((): string =>
  isValidDateFormat(datetimePicker.value) ? `${datetimePicker.value}` : "",
);

const DEFAULT_TIME = computed((): string =>
  props.useSeconds ? "00:00:00" : "00:00",
);

const DATETIMEPICKER_FORMAT = computed((): string =>
  props.useSeconds
    ? envs.DATETIME_FORMAT_STRING
    : envs.DATETIME_MINUTE_FORMAT_STRING,
);

const datePicker = computed({
  get(): DateTime {
    return datetimePicker.value
      ? dayjs(datetimePicker.value).format(envs.DATE_FORMAT_STRING)
      : "";
  },
  set(val: DateTime) {
    const time = timePicker.value
      ? timePicker.value
      : tempTimeValue.value ?? DEFAULT_TIME.value;
    datetimePicker.value = `${val} ${
      minDate.value === val &&
      !dayjs(`${minDate.value} ${time}`).isAfter(dayjs(props.min))
        ? dayjs(props.min).format(TIMEPICKER_FORMAT.value)
        : maxDate.value === val &&
          !dayjs(`${maxDate.value} ${time}`).isBefore(dayjs(props.max))
        ? dayjs(props.max).format(TIMEPICKER_FORMAT.value)
        : time
    }`;
    tempTimeValue.value = null;
  },
});
const timePicker = computed({
  get(): DateTime {
    return datetimePicker.value
      ? dayjs(datetimePicker.value).format(TIMEPICKER_FORMAT.value)
      : "";
  },
  set(val: DateTime) {
    if (datePicker.value) {
      datetimePicker.value = `${datePicker.value} ${val}`;
    } else {
      tempTimeValue.value = val;
    }
  },
});
const dialog = ref(false);

const maxDate = computed((): string => formatDate(props.max));
const minDate = computed((): string => formatDate(props.min));
const maxTime = computed((): string =>
  maxDate.value && datePicker.value && maxDate.value === datePicker.value
    ? dayjs(props.max).format(TIMEPICKER_FORMAT.value)
    : "",
);
const minTime = computed((): string =>
  minDate.value && datePicker.value && minDate.value === datePicker.value
    ? dayjs(props.min).format(TIMEPICKER_FORMAT.value)
    : "",
);

const style = computed((): string | undefined => {
  if (props.fullWidth) {
    return undefined;
  }
  let defaultWidth = 9.5;
  defaultWidth +=
    ((props.useSeconds
      ? envs.DATETIME_FORMAT_STRING.length
      : envs.DATETIME_MINUTE_FORMAT_STRING.length) -
      12) *
    0.4;
  props.clearable && (defaultWidth += 1);
  props.startType && (defaultWidth += 2);
  return `max-width: ${defaultWidth}rem;`;
});

const classSet = computed(
  (): string =>
    ` ${props.endType ? "ml-3" : ""} ${props.required ? "required" : ""}`,
);

const hint = computed((): string | undefined =>
  value.value ? dayjs(value.value).toISOString() : undefined,
);

const disableToday = computed(
  (): boolean =>
    (isValidDateFormat(props.min) && dayjs().isBefore(dayjs(props.min))) ||
    (isValidDateFormat(props.max) && dayjs().isAfter(dayjs(props.max))),
);

function setNow(): void {
  datetimePicker.value = dayjs().format(DATETIMEPICKER_FORMAT.value);
}

function selectingHourIfNoneTimerOption(): void {
  if (!props.useMinutes && !props.useSeconds) {
    nextTick(() => {
      const hour = refTimePicker.value.inputHour;
      refTimePicker.value.selectingHour = true;
      timePicker.value = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    });
  }
}

async function save(): Promise<void> {
  refDialog.value?.save(datetimePicker.value);
  value.value = dayjs(datetimePicker.value).toISOString();
  dialog.value = false;
}

watch(
  () => value.value,
  (val: DateTime) => {
    datetimePicker.value = isValidDateFormat(val)
      ? dayjs(val).format(DATETIMEPICKER_FORMAT.value)
      : "";
  },
  { immediate: true },
);
const refDialog = ref();
const refTimePicker = ref();
</script>
