<template>
  <div>
    <validation-observer ref="observer">
      <v-dialog
        ref="refDialog"
        v-model="dialog"
        :return-value.sync="pickerString"
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
              outlined
              persistent-hint
              :messages="message"
              prepend-inner-icon="mdi-calendar-cursor"
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
              @click:clear="() => emits('input', null)"
              v-on="on"
            />
          </validation-provider>
        </template>
        <v-date-picker
          v-model="pickerString"
          :locale="envs.LOCALE"
          landscape
          reactive
          scrollable
          :max="max"
          :min="min"
        >
          <v-btn outlined :disabled="disableToday" @click="setToday">
            오늘
          </v-btn>
          <div class="flex-grow-1" />
          <v-btn outlined @click="dialog = false"> 취소</v-btn>
          <v-btn outlined @click="save"> 확인</v-btn>
        </v-date-picker>
      </v-dialog>
    </validation-observer>
  </div>
</template>

<script setup lang="ts">
import envs from "@/constants/envs";
import dayjs from "dayjs";
import { ValidationObserver } from "vee-validate";
import type { DateTime } from "@/definitions/types";
import { computed, ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { formatDate } from "@/utils/formatter";

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
    startType?: boolean;
    endType?: boolean;
    fullWidth?: boolean;
    hideHint?: boolean;
    hideLabel?: boolean;
    max?: string;
    min?: string;
  }>(),
  {
    value: null,
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
const pickerString = ref<string | null>(null);
const dialog = ref(false);

const style = computed((): string | undefined => {
  if (props.fullWidth) {
    return undefined;
  }
  let defaultWidth = 10;
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
  value.value && dayjs(value.value).isValid()
    ? dayjs(value.value).toISOString()
    : undefined,
);

const disableToday = computed((): boolean => {
  if (!props.min && !props.max) {
    return false;
  }
  return props.endType
    ? dayjs().isBefore(dayjs(props.min, envs.DATE_FORMAT_STRING))
    : dayjs().isAfter(dayjs(props.max, envs.DATE_FORMAT_STRING));
});

const textFieldString = computed((): string => {
  return formatDate(pickerString.value);
});

function setToday(): void {
  pickerString.value = dayjs().format(envs.DATE_FORMAT_STRING);
}

async function validate(): Promise<boolean> {
  return !!(await observer.value?.validate());
}

async function save() {
  if (await validate()) {
    refDialog.value?.save(pickerString.value);
    if (textFieldString.value) {
      emits(
        "input",
        props.endType
          ? dayjs(textFieldString.value).endOf("day").toISOString()
          : dayjs(textFieldString.value).startOf("day").toISOString(),
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
    pickerString.value = formatDate(val);
  },
  { immediate: true },
);
const observer = ref();
const refDialog = ref();
defineExpose({ validate });
</script>
