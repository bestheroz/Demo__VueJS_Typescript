<template>
  <div>
    <v-menu
      rounded="lg"
      :close-on-content-click="false"
      :close-on-click="closeOnClick"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          :color="filteredLength === 0 ? 'secondary' : 'primary'"
          outlined
          tile
          filter
          small
          filter-icon="mdi-filter-variant"
          :input-value="true"
          v-bind="attrs"
          class="pa-2"
          label
          v-on="on"
        >
          필터 ({{ filteredLength }} / {{ cloneFilters.length }})
        </v-btn>
      </template>
      <v-card min-width="400" class="mt-5">
        <v-row no-gutters>
          <div>
            <v-list-item-group v-model="index" mandatory>
              <v-list-item
                v-for="filter in cloneFilters"
                :key="filter.key"
                :disabled="filter.disabled"
                active-class="primary--text"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="filter.text" />
                </v-list-item-content>
                <v-list-item-icon>
                  <v-icon> mdi-chevron-right</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list-item-group>
          </div>

          <v-col>
            <DataTableFilterItems
              v-model="cloneFilters[index]"
              @change="onChangeFilter"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-menu>
    <!--    필터 선택 Chip 부분-->
    <span
      v-for="(filter, _index) in cloneFilters"
      :key="filter.key"
      class="d-inline-flex ml-1 mt-0 mb-1"
    >
      <DataTableFilterSelectedChip
        v-model="cloneFilters[_index]"
        @change="onChangeFilter"
        @close-on-click-change="closeOnClickChange"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Filter, FilterItemType } from "@/definitions/types";
import DataTableFilterItems from "@/components/datatable/DataTableFilterItems.vue";
import DataTableFilterSelectedChip from "@/components/datatable/DataTableFilterSelectedChip.vue";
import { computed, onMounted, ref } from "vue";
import { watchDebounced } from "@vueuse/core";

const props = defineProps<{ filters: Filter[] }>();

const emits = defineEmits<{
  (e: "update:output", output: { [k: string]: FilterItemType[] }): void;
}>();

const closeOnClick = ref(true);
const cloneFilters = ref<Filter[]>([]);
const index = ref(0);

const filteredLength = computed(
  (): number =>
    cloneFilters.value
      .map((f) => f.items.some((i) => i.checked))
      .filter((f) => f).length,
);
function resetFilter(): void {
  cloneFilters.value = [];
  changeCloneFilters(props.filters);
}

function closeOnClickChange(value: boolean): void {
  closeOnClick.value = value;
}

function changeCloneFilters(val: Filter[]): void {
  cloneFilters.value = val.map((f) => {
    const cloneItems =
      cloneFilters.value.find((c) => c.key === f.key)?.items ?? [];
    return {
      ...f,
      items: f.items.map((i) => {
        return {
          ...i,
          checked:
            cloneItems.find((ci) => ci.value === i.value)?.checked || i.checked,
        };
      }),
    };
  });
}
function onChangeFilter(): void {
  emits(
    "update:output",
    Object.fromEntries(
      Object.entries(
        cloneFilters.value
          .filter((v) => v.items.some((i) => i.checked))
          .map((v) => {
            return {
              key: v.key,
              value: v.items.filter((i) => i.checked).map((i) => i.value),
            };
          }),
      ).map(([, v]) => {
        return [v.key, v.value];
      }),
    ),
  );
}
watchDebounced(
  () => props.filters,
  (val: Filter[]) => {
    changeCloneFilters(val);
    onChangeFilter();
  },
  { debounce: 200 },
);
onMounted(() => {
  changeCloneFilters(props.filters);
  onChangeFilter();
});
defineExpose({ resetFilter });
</script>
