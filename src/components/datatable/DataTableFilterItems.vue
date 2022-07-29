<template>
  <div>
    <v-list class="py-0" v-if="!(datePickerType || datetimePickerType)">
      <v-list-item
        v-for="item in value.items"
        :key="value.type === FILTER_TYPE.CHECKBOX ? item.value : item.text"
        :ripple="false"
        :style="{
          boxShadow: value.type === FILTER_TYPE.TEXT ? 'none' : '',
        }"
      >
        <v-list-item-action
          class="mr-4"
          v-if="value.type === FILTER_TYPE.CHECKBOX"
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
            @click="onClickCheckbox(item)"
          />
        </v-list-item-action>
        <v-list-item-action v-if="value.type === FILTER_TYPE.CHECKBOX">
          <v-list-itemTitle
            v-text="item.text"
            :class="item.checked ? 'primary--text' : 'secondary--text'"
          />
        </v-list-item-action>
        <v-list-item-content
          v-else-if="value.type === FILTER_TYPE.TEXT"
          class="py-0"
        >
          <v-text-field
            :value="item.value"
            :placeholder="item.text"
            @input="(_item) => onUpdateTextField(_item, item)"
            :rules="[textFilterRules.counter]"
            :disabled="fromChip"
            clearable
            counter
            maxlength="20"
          />
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list class="py-0" v-else>
      <v-list-item
        v-if="value.type === FILTER_TYPE.DATE_PICKER"
        :ripple="false"
      >
        <DatePicker
          :value="before"
          :placeholder="value.text"
          @input="onUpdatePicker"
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
          :value="before"
          :placeholder="value.text"
          @input="onUpdatePicker"
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
        v-else-if="value.type === FILTER_TYPE.DATE_START_END_PICKER"
        :ripple="false"
      >
        <DateStartEndPicker
          :start="after"
          :start-placeholder="afterPlaceholder"
          @update:start="onUpdateStartPicker"
          :end="before"
          :end-placeholder="beforePlaceholder"
          @update:end="onUpdateEndPicker"
          hide-details
          hide-label
          clearable
          full-width
        />
      </v-list-item>
      <v-list-item
        v-else-if="value.type === FILTER_TYPE.DATETIME_START_END_PICKER"
        :ripple="false"
      >
        <DatetimeStartEndPicker
          :start="after"
          :start-placeholder="afterPlaceholder"
          @update:start="onUpdateStartPicker"
          :end="before"
          :end-placeholder="beforePlaceholder"
          @update:end="onUpdateEndPicker"
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
import { FilterItemType } from "@/definitions/types";
import { computed, ref, watch } from "vue";
import DateStartEndPicker from "@/components/picker/DateStartEndPicker.vue";
import dayjs from "dayjs";
import DatePicker from "@/components/picker/DatePicker.vue";
import DatetimePicker from "@/components/picker/DatetimePicker.vue";
import DatetimeStartEndPicker from "@/components/picker/DatetimeStartEndPicker.vue";
import { useDebounceFn, useVModel } from "@vueuse/core";
import { FILTER_TYPE } from "@/definitions/selections";
import { formatDate, formatDatetime } from "@/utils/formatter";

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
  counter: (_value: string) =>
    _value ? _value.length <= 20 || "Max 20 characters" : true,
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
  [FILTER_TYPE.DATE_START_END_PICKER, FILTER_TYPE.DATE_PICKER].includes(
    value.value.type,
  ),
);

const datetimePickerType = computed(() =>
  [FILTER_TYPE.DATETIME_PICKER, FILTER_TYPE.DATETIME_START_END_PICKER].includes(
    value.value.type,
  ),
);

const DATEPICKER_FORMAT = "YYYY-MM-DD";
const DATETIMEPICKER_FORMAT = computed((): string =>
  value.value.timerOption === "second"
    ? "YYYY-MM-DD HH:mm:ss"
    : "YYYY-MM-DD HH:mm",
);
const after = computed((): DateTime => {
  if (datePickerType.value || datetimePickerType.value) {
    const after = value.value.items.find((i) => i.key === "after")?.value;
    return typeof after !== "boolean" ? after : "";
  }
  return "";
});
const before = computed((): DateTime => {
  if (datePickerType.value || datetimePickerType.value) {
    const before = value.value.items.find((i) => i.key === "before")?.value;
    return typeof before !== "boolean" ? before : "";
  }
  return "";
});

const afterPlaceholder = computed((): string => {
  if (datePickerType.value || datetimePickerType.value) {
    return value.value.items.find((i) => i.key === "after")?.text ?? "";
  }
  return "";
});

const beforePlaceholder = computed((): string => {
  if (datePickerType.value || datetimePickerType.value) {
    return value.value.items.find((i) => i.key === "before")?.text ?? "";
  }
  return "";
});

function onUpdateStartPicker(_value: DateTime): void {
  const valid = !!_value && dayjs(_value).isValid();
  const checked = valid || !!before.value;
  value.value.items = value.value.items.map((i) =>
    i.key === "after"
      ? {
          ...i,
          value: _value ? _value : "",
          chipText: datePickerType.value
            ? formatDate(_value)
            : formatDatetime(_value),
          checked: checked,
        }
      : {
          ...i,
          checked: checked,
        },
  );
  emits("change");
}

function onUpdateEndPicker(_value: DateTime): void {
  const valid = !!_value && dayjs(_value).isValid();
  const checked = valid || !!after.value;
  value.value.items = value.value.items.map((i) =>
    i.key === "before"
      ? {
          ...i,
          value: valid ? _value : "",
          chipText: datePickerType.value
            ? formatDate(_value)
            : formatDatetime(_value),
          checked: checked,
        }
      : {
          ...i,
          checked: checked,
        },
  );
  emits("change");
}

function onUpdatePicker(_value: DateTime): void {
  const valid = !!value && dayjs(_value).isValid();
  value.value.items = value.value.items.map((i) => {
    if (i.key === "before") {
      return {
        ...i,
        value: valid ? _value : "",
        chipText: datePickerType.value
          ? formatDate(_value)
          : formatDatetime(_value),
        checked: valid,
      };
    } else if (i.key === "after") {
      return {
        ...i,
        value: valid
          ? datePickerType.value
            ? dayjs(_value, DATEPICKER_FORMAT).endOf("day").toISOString()
            : dayjs(_value, DATETIMEPICKER_FORMAT.value)
                .endOf(
                  !value.value.timerOption ? "hour" : value.value.timerOption,
                )
                .toISOString()
          : "",
        checked: valid,
      };
    } else {
      return i;
    }
  });
  emits("change");
}

function onUpdateTextField(
  value: string,
  item: FilterItem<FilterItemType>,
): void {
  fetchList(value, item);
}
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
