<template>
  <div>
    <v-list v-if="!(datePickerType || datetimePickerType)" class="py-0" dense>
      <v-list-item
        v-for="item in value.items"
        :key="value.type === FILTER_TYPE.CHECKBOX ? item.value : item.text"
        :ripple="false"
        :style="{
          boxShadow: value.type === FILTER_TYPE.TEXT ? 'none' : '',
        }"
        dense
      >
        <v-list-item-title
          v-if="value.type === FILTER_TYPE.CHECKBOX"
          :class="item.checked ? 'primary--text' : 'secondary--text'"
        >
          <v-checkbox
            v-model="item.checked"
            :true-value="item.value"
            :disabled="value.required && checkedLength === 1 && item.checked"
            :style="
              item.checked
                ? 'color: var(--v-primary-base) !important'
                : undefined
            "
            :label="item.text"
            dense
            hide-details
            @click="onClickCheckbox(item)"
          />
        </v-list-item-title>
        <v-list-item-content
          v-else-if="value.type === FILTER_TYPE.TEXT"
          class="py-0"
        >
          <v-text-field
            :value="item.value"
            :placeholder="item.text"
            :rules="[textFilterRules.counter]"
            :disabled="fromChip"
            clearable
            counter
            maxlength="20"
            @input="(_item) => onUpdateTextField(_item, item)"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list v-else class="py-0">
      <v-list-item
        v-if="value.type === FILTER_TYPE.DATE_PICKER"
        :ripple="false"
        dense
      >
        <DatePicker
          v-model="datePicker"
          :placeholder="value.text"
          dense
          hide-details
          clearable
          hide-label
          hide-hint
          full-width
        />
      </v-list-item>
      <v-list-item
        v-else-if="value.type === FILTER_TYPE.DATETIME_PICKER"
        :ripple="false"
      >
        <DatetimePicker
          v-model="datetimePicker"
          :placeholder="value.text"
          dense
          hide-details
          :use-minutes="value.timerOption === 'minute'"
          :use-seconds="value.timerOption === 'second'"
          clearable
          hide-label
          hide-hint
          full-width
        />
      </v-list-item>
      <v-list-item
        v-if="value.type === FILTER_TYPE.DATE_RANGE_PICKER"
        :ripple="false"
      >
        <DateRangePicker
          :start.sync="startDateOfRange"
          :end.sync="endDateOfRange"
          :placeholder="value.text"
          dense
          hide-details
          clearable
          hide-label
          hide-hint
        />
      </v-list-item>
      <v-list-item
        v-else-if="value.type === FILTER_TYPE.DATETIME_RANGE_PICKER"
        :ripple="false"
      >
        <DatetimeRangePicker
          :start.sync="startDateTimeOfRange"
          :end.sync="endDateTimeOfRange"
          :placeholder="value.text"
          dense
          hide-details
          :use-minutes="value.timerOption === 'minute'"
          :use-seconds="value.timerOption === 'second'"
          clearable
          hide-label
          hide-hint
          full-width
        />
      </v-list-item>
      <v-list-item
        v-else-if="value.type === FILTER_TYPE.DATETIME_START_END_PICKER"
        :ripple="false"
      >
        <DatetimeStartEndPicker
          :start.sync="startDateTime"
          :start-placeholder="startPlaceholder"
          :end.sync="endDateTime"
          :end-placeholder="endPlaceholder"
          hide-details
          hide-label
          :use-minutes="value.timerOption === 'minute'"
          :use-seconds="value.timerOption === 'second'"
          clearable
          full-width
        />
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup lang="ts">
import type { DateTime, Filter, FilterItem } from "@/definitions/types";
import type { FilterItemType } from "@/definitions/types";
import { computed, ref, watch } from "vue";
import dayjs from "dayjs";
import DatePicker from "@/components/picker/DatePicker.vue";
import DatetimePicker from "@/components/picker/DatetimePicker.vue";
import DatetimeStartEndPicker from "@/components/picker/DatetimeStartEndPicker.vue";
import { useDebounceFn, useVModel } from "@vueuse/core";
import { FILTER_TYPE } from "@/definitions/selections";
import {
  formatDate,
  formatDatetime,
  isValidDateFormat,
} from "@/utils/formatter";
import DateRangePicker from "@/components/picker/DateRangePicker.vue";
import DatetimeRangePicker from "@/components/picker/DatetimeRangePicker.vue";
import envs from "@/constants/envs";

const props = defineProps<{
  value: Filter;
  fromChip?: boolean;
}>();

const emits = defineEmits<{
  (e: "closed"): void;
  (e: "change"): void;
  (e: "input", v: Filter): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
const searchDialog = ref(false);
const checkedLength = computed(
  (): number => value.value.items.filter((i) => i.checked).length,
);
const textFilterRules = {
  counter: (value) =>
    value ? value.length <= 20 || "Max 20 characters" : true,
};

function onClickCheckbox(filterItem: FilterItem<FilterItemType>): void {
  if (value.value.single) {
    value.value = {
      ...value.value,
      items: value.value.items.map((item) => {
        return {
          ...item,
          checked: filterItem.checked && item.value === filterItem.value,
        };
      }),
    };
  }
  emits("change");
}

const datePickerType = computed(() =>
  [FILTER_TYPE.DATE_PICKER, FILTER_TYPE.DATE_RANGE_PICKER].includes(
    value.value.type,
  ),
);

const datetimePickerType = computed(() =>
  [
    FILTER_TYPE.DATETIME_PICKER,
    FILTER_TYPE.DATETIME_RANGE_PICKER,
    FILTER_TYPE.DATETIME_START_END_PICKER,
  ].includes(value.value.type),
);

const startDateOfRange = computed({
  get(): DateTime {
    const start = value.value.items[0]?.value;
    return typeof start !== "boolean" && isValidDateFormat(start) ? start : "";
  },
  set(date: DateTime) {
    const valid = isValidDateFormat(date);
    value.value.items.splice(0, 1, {
      text: startPlaceholder.value,
      value: valid ? date : "",
      chipText: valid ? dayjs(date).format(envs.DATE_FORMAT_STRING) : "",
      checked: valid,
    });
    debouncedEmitChange();
  },
});

const endDateOfRange = computed({
  get(): DateTime {
    const end = value.value.items[1]?.value;
    return typeof end !== "boolean" && isValidDateFormat(end) ? end : "";
  },
  set(date: DateTime) {
    const valid = isValidDateFormat(date);
    const endChipText = valid
      ? dayjs(date).format(envs.DATE_FORMAT_STRING)
      : "";

    value.value.items.splice(1, 1, {
      text: endPlaceholder.value,
      value: valid ? date : "",
      chipText:
        valid && endChipText !== value.value.items[0]?.chipText
          ? endChipText
          : "",
      checked: valid,
    });
    debouncedEmitChange();
  },
});

const startDateTimeOfRange = computed({
  get(): DateTime {
    const start = value.value.items[0]?.value;
    return typeof start !== "boolean" && isValidDateFormat(start) ? start : "";
  },
  set(datetime: DateTime) {
    const valid = isValidDateFormat(datetime);
    value.value.items.splice(0, 1, {
      text: startPlaceholder.value,
      value: valid ? datetime : "",
      chipText: valid
        ? dayjs(datetime).format(
            value.value.timerOption === "second"
              ? envs.DATETIME_FORMAT_STRING
              : envs.DATETIME_MINUTE_FORMAT_STRING,
          )
        : "",
      checked: valid,
    });
    debouncedEmitChange();
  },
});

const endDateTimeOfRange = computed({
  get(): DateTime {
    const end = value.value.items[1]?.value;
    return typeof end !== "boolean" && isValidDateFormat(end) ? end : "";
  },
  set(datetime: DateTime) {
    const valid = isValidDateFormat(datetime);
    const endChipText = valid
      ? dayjs(datetime).format(
          value.value.timerOption === "second"
            ? envs.DATETIME_FORMAT_STRING
            : envs.DATETIME_MINUTE_FORMAT_STRING,
        )
      : "";

    value.value.items.splice(1, 1, {
      text: endPlaceholder.value,
      value: valid ? datetime : "",
      chipText:
        valid && endChipText !== value.value.items[0]?.chipText
          ? endChipText
          : "",
      checked: valid,
    });
    debouncedEmitChange();
  },
});

const startDateTime = computed({
  get(): DateTime {
    const start = value.value.items[0]?.value;
    return typeof start !== "boolean" && isValidDateFormat(start) ? start : "";
  },
  set(datetime: DateTime) {
    const valid = isValidDateFormat(datetime);
    const checked = valid || !!value.value.items[1]?.value;

    value.value.items = [
      {
        text: startPlaceholder.value,
        value: valid ? datetime : undefined,
        chipText: valid
          ? dayjs(datetime).format(
              value.value.timerOption === "second"
                ? envs.DATETIME_FORMAT_STRING
                : envs.DATETIME_MINUTE_FORMAT_STRING,
            )
          : "",
        checked: checked,
      },
      {
        text: endPlaceholder.value,
        value: endDateTime.value ? endDateTime.value : undefined,
        chipText: value.value.items[1]?.chipText,
        checked: checked,
      },
    ];
    emits("change");
  },
});

const endDateTime = computed({
  get(): DateTime {
    const end = value.value.items[1]?.value;
    return typeof end !== "boolean" && isValidDateFormat(end) ? end : "";
  },
  set(datetime: DateTime) {
    const valid = isValidDateFormat(datetime);
    const checked = valid || !!value.value.items[0]?.value;
    value.value.items = [
      {
        text: startPlaceholder.value,
        value: startDateTime.value ? startDateTime.value : undefined,
        chipText: value.value.items[0]?.chipText,
        checked: checked,
      },
      {
        text: endPlaceholder.value,
        value: valid ? datetime : undefined,
        chipText: valid
          ? dayjs(datetime).format(
              value.value.timerOption === "second"
                ? envs.DATETIME_FORMAT_STRING
                : envs.DATETIME_MINUTE_FORMAT_STRING,
            )
          : "",
        checked: checked,
      },
    ];
    emits("change");
  },
});

const datePicker = computed({
  get(): DateTime {
    const date = value.value.items[0]?.value;
    return typeof date !== "boolean" && isValidDateFormat(date) ? date : "";
  },
  set(date: DateTime) {
    const valid = isValidDateFormat(date);
    value.value.items = [
      {
        text: startPlaceholder.value,
        value: valid ? date : "",
        chipText: formatDate(date),
        checked: valid,
      },
      {
        text: endPlaceholder.value,
        value: valid ? dayjs(date).endOf("day").toISOString() : "",
        chipText: "",
        checked: valid,
      },
    ];
    emits("change");
  },
});

const datetimePicker = computed({
  get(): DateTime {
    const datetime = value.value.items[0]?.value;
    return typeof datetime !== "boolean" && isValidDateFormat(datetime)
      ? datetime
      : "";
  },
  set(datetime: DateTime) {
    const valid = isValidDateFormat(datetime);
    value.value.items = [
      {
        text: startPlaceholder.value,
        value: valid ? datetime : undefined,
        chipText: formatDatetime(datetime),
        checked: valid,
      },
      {
        text: endPlaceholder.value,
        value: valid
          ? dayjs(datetime)
              .endOf(
                !value.value.timerOption ? "hour" : value.value.timerOption,
              )
              .toISOString()
          : "",
        chipText: "",
        checked: valid,
      },
    ];
    emits("change");
  },
});

const startPlaceholder = computed((): string => {
  return value.value.items[0]?.text ?? "";
});

const endPlaceholder = computed((): string => {
  return value.value.items[1]?.text ?? "";
});

function onUpdateTextField(
  value: string,
  item: FilterItem<FilterItemType>,
): void {
  fetchList(value, item);
}

const debouncedEmitChange = useDebounceFn((): void => {
  emits("change");
}, 100);

const fetchList = useDebounceFn(
  (value: string, item: FilterItem<FilterItemType>): void => {
    item.value = value;
    item.checked = !!value;
    emits("change");
  },
  300,
);
watch(
  () => searchDialog.value,
  (val: boolean) => {
    if (!val) {
      emits("closed");
    }
  },
  { immediate: true },
);
</script>
