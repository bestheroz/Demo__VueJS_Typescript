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
          :messages="message"
          filled
          prepend-inner-icon="mdi-calendar-cursor"
          readonly
          :disabled="disabled"
          :dense="dense"
          :hide-details="hideDetails"
          :error-messages="errors"
          :clearable="clearable"
          :class="required ? 'required' : ''"
          @click:prepend-inner="dialog = true"
          @click:clear="[start, end] = [null, null]"
          v-on="on"
        />
      </validation-provider>
    </template>
    <v-date-picker
      v-model="pickerArray"
      :locale="envs.LOCALE"
      landscape
      reactive
      scrollable
      :max="max"
      :min="min"
      range
      @change="sortPickerArray"
    >
      <v-btn tile filled @click="setToday"> 오늘</v-btn>
      <div class="flex-grow-1" />
      <v-btn tile filled @click="dialog = false"> 취소</v-btn>
      <v-btn tile filled @click="save"> 확인</v-btn>
    </v-date-picker>
  </v-dialog>
</template>

<script setup lang="ts">
import envs from "@/constants/envs";
import dayjs from "dayjs";
import type { DateTime } from "@/definitions/types";
import { computed, ref, watch } from "vue";
import { useVModels } from "@vueuse/core";
import { isValidDateFormat } from "@/utils/formatter";

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
    hideLabel?: boolean;
    max?: string;
    min?: string;
  }>(),
  {
    label: "날짜 또는 기간 선택",
    placeholder: undefined,
    dense: true,
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

const textFieldString = computed((): string => {
  return pickerArray.value
    .reduce(
      (prev, val) => (prev.includes(val) ? prev : [...prev, val]),
      [] as DateTime[],
    )
    .join(" ~ ");
});

function sortPickerArray(val: DateTime[]) {
  pickerArray.value = val.sort();
}

function setToday(): void {
  const today = dayjs().format(envs.DATE_FORMAT_STRING);
  pickerArray.value = pickerArray.value[1]
    ? [today]
    : [today, pickerArray.value[0]].sort();
}

function save() {
  if (pickerArray.value.length === 1) {
    const autoEnd = dayjs(pickerArray.value[0]).format(envs.DATE_FORMAT_STRING);
    pickerArray.value = [pickerArray.value[0], autoEnd];
  }
  [start.value, end.value] = pickerArray.value.map((val, index) =>
    index === 0
      ? dayjs(val).startOf("day").toISOString()
      : dayjs(val).endOf("day").toISOString(),
  );
  refDialog.value?.save(pickerArray.value);
  dialog.value = false;
}

watch(
  () => [start.value, end.value],
  (val: DateTime[]) => {
    pickerArray.value = val
      .filter((v) => isValidDateFormat(v))
      .map((v) => dayjs(v).format(envs.DATE_FORMAT_STRING))
      .reduce(
        (prev, val) => (prev.includes(val) ? prev : [...prev, val]),
        [] as string[],
      );
  },
  { immediate: true },
);
const refDialog = ref();
</script>
