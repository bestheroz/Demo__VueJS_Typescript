<template>
  <div>
    <v-menu v-model="isOpen" rounded="lg" offset-y>
      <template #activator="{ on }">
        <v-btn
          v-show="chipLabel"
          :close="!value.required"
          filled
          tile
          small
          :color="value.required ? 'error' : 'primary'"
          class="pa-2"
          label
          style="z-index: 9"
          v-on="on"
          @mouseenter="emits('close-on-click-change', false)"
          @mouseleave="emits('close-on-click-change', true)"
        >
          {{ chipLabel }}
          <v-icon v-if="!value.required" small @click="emptySelectFilters">
            mdi-close
          </v-icon>
        </v-btn>
      </template>
      <v-card
        v-if="
          isOpen &&
          filtered.items.length > 0 &&
          filtered.type !== FILTER_TYPE.TEXT
        "
      >
        <DataTableFilterItems
          v-model="value"
          from-chip
          @closed="isOpen = false"
          @change="emits('change')"
        />
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type { Filter, FilterItemType } from "@/definitions/types";
import DataTableFilterItems from "@/components/datatable/DataTableFilterItems.vue";
import { computed, ref } from "vue";
import { useVModel } from "@vueuse/core";
import { FILTER_TYPE } from "@/definitions/selections";

const props = defineProps<{
  value: Filter;
}>();

const emits = defineEmits<{
  (e: "change"): void;
  (e: "close-on-click-change", value: boolean): void;
  (e: "input", v: Filter): void;
}>();
const value = useVModel(props, "value", emits, { eventName: "input" });
const isOpen = ref(false);

const filtered = computed((): Filter => {
  return {
    ...value.value,
    items: value.value.items.filter((i) => i.checked),
  };
});
const chipLabel = computed((): string | undefined => {
  if (filtered.value.items.length > 0) {
    if (filtered.value.type === FILTER_TYPE.TEXT) {
      return `${filtered.value.text} = ["${
        filtered.value.items[0].chipText ?? filtered.value.items[0].value
      }"]`;
    } else if (FILTER_TYPE.DATETIME_START_END_PICKER === filtered.value.type) {
      return `${filtered.value.text} = [${
        filtered.value.items[0]?.chipText ?? ""
      } ~ ${filtered.value.items[1]?.chipText ?? ""}]`;
    } else if (
      [FILTER_TYPE.DATE_PICKER, FILTER_TYPE.DATETIME_PICKER].includes(
        filtered.value.type,
      )
    ) {
      return `${filtered.value.text} = [${filtered.value.items[0].chipText}]`;
    } else if (
      [
        FILTER_TYPE.DATE_RANGE_PICKER,
        FILTER_TYPE.DATETIME_RANGE_PICKER,
      ].includes(filtered.value.type)
    ) {
      return `${filtered.value.text} = [${filtered.value.items
        .filter((v) => v.chipText)
        .map((v) => v.chipText)
        .reduce(
          (prev, val) => (prev.includes(val) ? prev : [...prev, val]),
          [] as FilterItemType[],
        )
        .join(" ~ ")}]`;
    } else {
      return `${filtered.value.text} = ["${filtered.value.items
        .map((i) => i.text)
        /* eslint-disable quotes */
        .join('", "')}
    "]`;
    }
  }
  return undefined;
});

function emptySelectFilters(): void {
  value.value = {
    ...value.value,
    items: value.value.items.map((item) => {
      if (value.value.type === FILTER_TYPE.CHECKBOX) {
        return { ...item, checked: false };
      } else {
        return { ...item, checked: false, value: "", chipText: "" };
      }
    }),
  };
  emits("change");
}
</script>
