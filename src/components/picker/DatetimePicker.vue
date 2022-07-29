<template>
  <div>
    <validation-observer ref="observer">
      <v-dialog
        ref="refDialog"
        v-model="dialog"
        :return-value.sync="textFieldString"
        :width="470"
        @keydown.esc="dialog = false"
        @keydown.enter="save"
        :disabled="!hasWriteAuthority"
      >
        <template #activator="{ on }">
          <validation-provider
            :name="hideLabel ? placeholder : label"
            :rules="required ? 'required' : ''"
            v-slot="{ errors }"
          >
            <v-text-field
              :value="textFieldString"
              :label="hideLabel ? undefined : label"
              :placeholder="placeholder"
              :hint="hideHint ? undefined : hint"
              persistent-hint
              :messages="message"
              prepend-inner-icon="mdi-calendar-clock"
              @click:prepend-inner="dialog = true"
              readonly
              :disabled="disabled"
              :dense="dense"
              :hide-details="hideDetails"
              :clearable="clearable"
              @click:clear="() => emits('input', null)"
              :error-messages="errors"
              :append-outer-icon="startType ? 'mdi-tilde' : undefined"
              :class="classSet"
              :style="style"
              v-on="on"
            />
          </validation-provider>
        </template>
        <v-date-picker
          v-model="datePickerString"
          :locale="envs.LOCALE"
          landscape
          reactive
          :max="maxDate"
          :min="minDate"
        >
        </v-date-picker>
        <v-time-picker
          ref="refTimePicker"
          v-model="timePickerString"
          format="24hr"
          landscape
          :use-seconds="useSeconds"
          :max="maxTime"
          :min="minTime"
          @click:hour="selectingHourIfNoneTimerOption"
        >
          <v-btn outlined @click="setNow" :disabled="disableToday">
            지금
          </v-btn>
          <div class="flex-grow-1"></div>
          <v-btn outlined @click="dialog = false"> 취소 </v-btn>
          <v-btn outlined @click="save"> 확인 </v-btn>
        </v-time-picker>
      </v-dialog>
    </validation-observer>
  </div>
</template>

<script setup lang="ts">
import envs from "@/constants/envs";
import dayjs from "dayjs";
import { ValidationObserver } from "vee-validate";
import { DateTime } from "@/definitions/types";
import { computed, nextTick, ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority } = useAuthorityStore();

const props = withDefaults(
  defineProps<{
    value?: DateTime;
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
    max?: string[];
    min?: string[];
  }>(),
  {
    value: null,
    label: "날짜 선택",
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

const textFieldString = ref(null as string | null);
const datePickerString = ref(null as string | null);
const timePickerString = ref(null as string | null);
const dialog = ref(false);

const DATEPICKER_FORMAT = "YYYY-MM-DD";
const DATETIMEPICKER_MINUTE_FORMAT = "YYYY-MM-DD HH:mm";
const DATETIMEPICKER_FORMAT = "YYYY-MM-DD HH:mm:ss";
const TIMEPICKER_MINUTE_FORMAT = "HH:mm";
const TIMEPICKER_FORMAT = "HH:mm:ss";

const maxDate = computed((): string | undefined =>
  props.max?.length > 0 ? props.max[0] : undefined,
);

const maxTime = computed((): string | undefined =>
  props.max?.length > 1 ? props.max[1] : undefined,
);

const minDate = computed((): string | undefined =>
  props.min?.length > 0 ? props.min[0] : undefined,
);

const minTime = computed((): string | undefined =>
  props.min?.length > 1 ? props.min[1] : undefined,
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

const classSet = computed((): string | undefined => {
  let result = "";
  if (props.endType) {
    result += " ml-3";
  }
  if (props.required) {
    result += " required";
  }
  return result;
});

const hint = computed((): string | undefined =>
  value.value ? dayjs(value.value).toISOString() : undefined,
);

const disableToday = computed((): boolean => {
  if (!props.min && !props.max) {
    return false;
  }
  if (props.useSeconds) {
    return props.endType
      ? dayjs().isBefore(dayjs(props.min.join(" "), DATETIMEPICKER_FORMAT))
      : dayjs(props.max.join(" "), DATETIMEPICKER_FORMAT).isBefore(dayjs());
  } else {
    return props.endType
      ? dayjs().isBefore(
          dayjs(props.min.join(" "), DATETIMEPICKER_MINUTE_FORMAT),
        )
      : dayjs().isAfter(
          dayjs(props.max.join(" "), DATETIMEPICKER_MINUTE_FORMAT),
        );
  }
});

function watchDatePickerString(): void {
  if (
    !datePickerString.value ||
    !timePickerString.value ||
    !dayjs(
      `${datePickerString.value} ${timePickerString.value}`,
      props.useSeconds ? DATETIMEPICKER_FORMAT : DATETIMEPICKER_MINUTE_FORMAT,
    ).isValid()
  ) {
    textFieldString.value = null;
    return;
  }
  const _dayjs = dayjs(
    `${datePickerString} ${timePickerString}`,
    props.useSeconds ? DATETIMEPICKER_FORMAT : DATETIMEPICKER_MINUTE_FORMAT,
  );
  if (_dayjs) {
    textFieldString.value = props.useSeconds
      ? dayjs(
          `${datePickerString.value} ${timePickerString.value}`,
          envs.DATETIME_FORMAT_STRING,
        ).format(DATETIMEPICKER_FORMAT)
      : dayjs(
          `${datePickerString.value} ${timePickerString.value}`,
          envs.DATETIME_MINUTE_FORMAT_STRING,
        ).format(DATETIMEPICKER_MINUTE_FORMAT);
  } else {
    textFieldString.value = null;
  }
}
function setNow(): void {
  datePickerString.value = dayjs().format(DATEPICKER_FORMAT);
  timePickerString.value = props.useSeconds
    ? dayjs().format(TIMEPICKER_FORMAT)
    : dayjs().format(TIMEPICKER_MINUTE_FORMAT);
}
function selectingHourIfNoneTimerOption(): void {
  if (!props.useMinutes && !props.useSeconds) {
    nextTick(() => {
      refTimePicker.value.selectingHour = true;
      timePickerString.value = refTimePicker.value.inputHour + ":00";
    });
  }
}
async function validate(): Promise<boolean> {
  return !!(await observer.value?.validate());
}
async function save(): Promise<void> {
  if (await validate()) {
    refDialog.value?.save(textFieldString.value);
    if (
      dayjs(textFieldString.value, envs.DATETIME_MINUTE_FORMAT_STRING).isValid()
    ) {
      emits(
        "input",
        props.endType
          ? props.useSeconds
            ? dayjs(textFieldString.value, envs.DATETIME_FORMAT_STRING)
                ?.endOf("second")
                ?.toISOString()
            : dayjs(textFieldString.value, envs.DATETIME_MINUTE_FORMAT_STRING)
                ?.endOf("minute")
                ?.toISOString()
          : props.useSeconds
          ? dayjs(textFieldString.value, envs.DATETIME_FORMAT_STRING)
              ?.startOf("second")
              ?.toISOString()
          : dayjs(textFieldString.value, envs.DATETIME_MINUTE_FORMAT_STRING)
              ?.startOf("minute")
              ?.toISOString(),
      );
    } else {
      emits("input", null);
    }
    dialog.value = false;
  }
}
watch(
  () => value.value,
  (val: DateTime) => {
    datePickerString.value =
      val && dayjs(val).isValid() ? dayjs(val).format(DATEPICKER_FORMAT) : "";
    timePickerString.value =
      val && dayjs(val).isValid()
        ? props.useSeconds
          ? dayjs(val).format(TIMEPICKER_FORMAT)
          : dayjs(val).format(TIMEPICKER_MINUTE_FORMAT)
        : "";
  },
  { immediate: true },
);
watch(
  () => datePickerString.value,
  () => {
    watchDatePickerString();
  },
);
watch(
  () => timePickerString.value,
  () => {
    watchDatePickerString();
  },
  { immediate: true },
);
const observer = ref();
const refDialog = ref();
const refTimePicker = ref();
defineExpose({ save });
</script>
