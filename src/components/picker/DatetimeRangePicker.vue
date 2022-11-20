<template>
  <v-dialog
    ref="refDialog"
    v-model="dialog"
    :width="470"
    :return-value.sync="pickerArray"
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
          persistent-hint
          filled
          :messages="message"
          prepend-inner-icon="mdi-calendar-clock"
          readonly
          :disabled="disabled"
          :dense="dense"
          :hide-details="hideDetails"
          :clearable="clearable"
          :error-messages="errors"
          :class="required ? 'required' : ''"
          @click:prepend-inner="dialog = true"
          @click:clear="[start, end, endTimePickerShow] = [null, null, false]"
          v-on="on"
        />
      </validation-provider>
    </template>
    <v-date-picker
      v-model="datePicker"
      :locale="envs.LOCALE"
      landscape
      reactive
      scrollable
      :disabled="disablePicker"
      :max="maxDate"
      :min="minDate"
      range
    />
    <v-time-picker
      v-show="!endTimePickerShow"
      ref="refStartTimePicker"
      v-model="startTimePicker"
      format="24hr"
      landscape
      :disabled="disablePicker"
      :use-seconds="useSeconds"
      :max="startMaxTime"
      :min="startMinTime"
      @click:hour="selectingHourIfNoneTimerOption('start')"
    >
      <v-switch
        v-model="endTimePickerShow"
        inset
        hint="시작시간"
        persistent-hint
        :disabled="!pickerArray[0]"
        @click="autoEndDatePush"
      />
      <v-btn tile filled :disabled="disableToday" @click="setNow"> 지금</v-btn>
      <v-btn tile filled @click="dialog = false"> 취소</v-btn>
      <v-btn tile filled @click="save"> 확인</v-btn>
    </v-time-picker>
    <v-time-picker
      v-show="endTimePickerShow"
      ref="refEndTimePicker"
      v-model="endTimePicker"
      format="24hr"
      landscape
      :disabled="disablePicker"
      :use-seconds="useSeconds"
      :max="endMaxTime"
      :min="endMinTime"
      @click:hour="selectingHourIfNoneTimerOption('end')"
    >
      <v-switch
        v-model="endTimePickerShow"
        inset
        hint="종료시간"
        persistent-hint
      />
      <v-btn tile filled :disabled="disableToday" @click="setNow"> 지금</v-btn>
      <v-btn tile filled @click="dialog = false"> 취소</v-btn>
      <v-btn tile filled @click="save"> 확인</v-btn>
    </v-time-picker>
  </v-dialog>
</template>

<script setup lang="ts">
import envs from "@/constants/envs";
import dayjs from "dayjs";
import type { DateTime } from "@/definitions/types";
import { computed, nextTick, ref, watch } from "vue";
import { useVModels } from "@vueuse/core";
import { formatDate, isValidDateFormat } from "@/utils/formatter";

const props = withDefaults(
  defineProps<{
    start: DateTime;
    end: DateTime;
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
    fullWidth?: boolean;
    hideHint?: boolean;
    hideLabel?: boolean;
    max?: string;
    min?: string;
  }>(),
  {
    label: "일시 또는 기간 선택",
    dense: true,
    placeholder: undefined,
    message: undefined,
    max: undefined,
    min: undefined,
  },
);

const emits = defineEmits<{
  (e: "update:start", value: DateTime): void;
  (e: "update:end", value: DateTime): void;
}>();

const { start, end } = useVModels(props, emits);
const pickerArray = ref<DateTime[]>([]);
const dialog = ref(false);
const endTimePickerShow = ref(false);

const tempTimeValue = ref<DateTime>(null);

const DATETIMEPICKER_FORMAT = computed((): string =>
  props.useSeconds
    ? envs.DATETIME_FORMAT_STRING
    : envs.DATETIME_MINUTE_FORMAT_STRING,
);
const TIMEPICKER_FORMAT = computed((): string =>
  props.useSeconds ? envs.TIME_FORMAT_STRING : envs.TIME_MINUTE_FORMAT_STRING,
);

const DEFAULT_TIME = computed((): string =>
  props.useSeconds ? "00:00:00" : "00:00",
);

const TIMEUNIT = computed((): "hour" | "minute" | "second" =>
  props.useSeconds ? "second" : props.useMinutes ? "minute" : "hour",
);

const maxDate = computed((): string => {
  return formatDate(props.max);
});
const minDate = computed((): string => {
  return formatDate(props.min);
});

const endMaxTime = computed((): string =>
  maxDate.value && datePicker.value[1] && maxDate.value === datePicker.value[1]
    ? dayjs(props.max).format(TIMEPICKER_FORMAT.value)
    : "",
);

const startMinTime = computed((): string =>
  minDate.value && datePicker.value[0] && minDate.value === datePicker.value[0]
    ? dayjs(props.min).format(TIMEPICKER_FORMAT.value)
    : "",
);

const endMinTime = computed((): string =>
  datePicker.value[0] === datePicker.value[1]
    ? dayjs(pickerArray.value[0]).format(TIMEPICKER_FORMAT.value)
    : "",
);

const startMaxTime = computed((): string =>
  datePicker.value[1]
    ? datePicker.value[0] === datePicker.value[1]
      ? dayjs(pickerArray.value[1]).format(TIMEPICKER_FORMAT.value)
      : ""
    : maxDate.value && maxDate.value === datePicker.value[0]
    ? dayjs(props.max).format(TIMEPICKER_FORMAT.value)
    : "",
);

const textFieldString = computed((): string => {
  return pickerArray.value
    .reduce(
      (prev, val) => (prev.includes(val) ? prev : [...prev, val]),
      [] as DateTime[],
    )
    .join(" ~ ");
});

const datePicker = computed({
  get(): DateTime[] {
    return pickerArray.value.map((v) =>
      dayjs(v).format(envs.DATE_FORMAT_STRING),
    );
  },
  set(val: DateTime[]) {
    endTimePickerShow.value =
      val.length === 2 && !dayjs(val[0]).isAfter(val[1]);
    const time = tempTimeValue.value ?? DEFAULT_TIME.value;
    pickerArray.value = val
      .map(
        (v, index) =>
          `${v} ${
            val.length < 2
              ? minDate.value === v &&
                !dayjs(`${minDate.value} ${time}`).isAfter(dayjs(props.min))
                ? dayjs(props.min).format(TIMEPICKER_FORMAT.value)
                : maxDate.value === v &&
                  !dayjs(`${maxDate.value} ${time}`).isBefore(dayjs(props.max))
                ? dayjs(props.max).format(TIMEPICKER_FORMAT.value)
                : time
              : index === 0 || val[0] === val[1]
              ? startTimePicker.value
              : dayjs(val[0]).isAfter(val[1]) && minDate.value === v
              ? dayjs(props.min).format(TIMEPICKER_FORMAT.value)
              : DEFAULT_TIME.value
          }`,
      )
      .sort();
    focusOnHourPicker();
    tempTimeValue.value = null;
  },
});

const startTimePicker = computed({
  get(): string {
    return (
      pickerArray.value
        .filter((_v, index) => index === 0)
        .map((v) => dayjs(v).format(TIMEPICKER_FORMAT.value))
        .pop() ?? DEFAULT_TIME.value
    );
  },
  set(val: string): void {
    if (datePicker.value[0]) {
      pickerArray.value = pickerArray.value.map((v, index) =>
        index === 0 ? `${dayjs(v).format(envs.DATE_FORMAT_STRING)} ${val}` : v,
      );
    } else {
      tempTimeValue.value = val;
    }
  },
});

const endTimePicker = computed({
  get(): string {
    return (
      pickerArray.value
        .filter((_v, index) => index === 1)
        .map((v) => dayjs(v).format(TIMEPICKER_FORMAT.value))
        .pop() ?? DEFAULT_TIME.value
    );
  },
  set(val: string): void {
    pickerArray.value = pickerArray.value.map((v, index) =>
      index === 1 ? `${dayjs(v).format(envs.DATE_FORMAT_STRING)} ${val}` : v,
    );
  },
});

const disableToday = computed(
  (): boolean =>
    (isValidDateFormat(props.min) && dayjs().isBefore(dayjs(props.min))) ||
    (isValidDateFormat(props.max) && dayjs().isAfter(dayjs(props.max))),
);

const disablePicker = computed(
  (): boolean =>
    !!props.max && !!props.min && dayjs(props.max).isBefore(props.min),
);

function autoEndDatePush(): void {
  if (!pickerArray.value[1]) {
    pickerArray.value.splice(1, 1, `${pickerArray.value[0]}`);
  }
}

function setNow(): void {
  const now = dayjs().format(DATETIMEPICKER_FORMAT.value);
  endTimePickerShow.value =
    pickerArray.value.length === 1 && !dayjs(pickerArray.value[0]).isAfter(now);
  pickerArray.value = pickerArray.value[1]
    ? [now]
    : [now, pickerArray.value[0]].sort();
}

function focusOnHourPicker(): void {
  refStartTimePicker.value.selectingHour = false;
  refEndTimePicker.value.selectingHour = false;
}

function selectingHourIfNoneTimerOption(type: "start" | "end"): void {
  if (!props.useMinutes && !props.useSeconds) {
    nextTick(() => {
      if (type === "start") {
        const startHour = refStartTimePicker.value.inputHour;
        refStartTimePicker.value.selectingHour = true;
        startTimePicker.value =
          startHour < 10 ? `0${startHour}:00` : `${startHour}:00`;
      } else {
        const endHour = refEndTimePicker.value.inputHour;
        refEndTimePicker.value.selectingHour = true;
        endTimePicker.value = endHour < 10 ? `0${endHour}:00` : `${endHour}:00`;
      }
    });
  }
}

async function save(): Promise<void> {
  if (pickerArray.value.length === 1) {
    const autoEnd = dayjs(pickerArray.value[0]).format(
      DATETIMEPICKER_FORMAT.value,
    );
    pickerArray.value = [pickerArray.value[0], autoEnd];
  }
  [start.value, end.value] = pickerArray.value.map((v, index) =>
    index == 0
      ? dayjs(v).toISOString()
      : TIMEUNIT.value === "hour" &&
        pickerArray.value[0] !== pickerArray.value[1]
      ? dayjs(v).endOf("minutes").toISOString()
      : dayjs(v).endOf(TIMEUNIT.value).toISOString(),
  );
  refDialog.value?.save(pickerArray.value);
  dialog.value = false;
}

watch(
  () => [start.value, end.value],
  (value: DateTime[]) => {
    pickerArray.value = value
      .filter((v) => isValidDateFormat(v))
      .map((v) => dayjs(v).format(DATETIMEPICKER_FORMAT.value))
      .reduce(
        (prev, val) => (prev.includes(val) ? prev : [...prev, val]),
        [] as string[],
      );
  },
  { immediate: true },
);

watch(
  () => [start.value],
  () => {
    if (dayjs(start.value).isAfter(end.value)) {
      start.value = end.value;
    }
  },
);
watch(
  () => [end.value],
  () => {
    if (dayjs(start.value).isAfter(end.value)) {
      end.value = start.value;
    }
  },
);

const refDialog = ref();
const refStartTimePicker = ref();
const refEndTimePicker = ref();
</script>
