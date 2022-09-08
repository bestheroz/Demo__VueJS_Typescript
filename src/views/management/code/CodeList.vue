<template>
  <div>
    <PageTitle @click="showAddDialog" :button-loading="saving">
      <template #more-buttons>
        <v-btn
          @click="saveItems"
          color="primary"
          outlined
          x-large
          v-if="hasWriteAuthority"
        >
          <v-icon> mdi-sort</v-icon>
          순서저장
        </v-btn>
        <v-btn @click="fetchList" color="primary" outlined x-large>
          <v-icon> mdi-refresh</v-icon>
          새로고침
        </v-btn>
      </template>
    </PageTitle>
    <v-card>
      <v-card-text>
        <DataTableFilter :filters="filters" :output.sync="filterOutput" />
        <div>
          <v-simple-table fixed-header class="sortableTable">
            <template #default>
              <thead>
                <tr>
                  <th class="text-left">코드</th>
                  <th class="text-left">코드명</th>
                  <th class="text-center">사용 가능</th>
                  <th class="text-center">작업 일시</th>
                  <th class="text-center" v-if="hasDeleteAuthority">Action</th>
                </tr>
                <tr>
                  <td colspan="10" class="px-0" style="height: 0">
                    <v-progress-linear
                      height="0.5rem"
                      indeterminate
                      v-if="loading"
                    />
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-if="items.length === 0 && !loading">
                  <td :colspan="6" class="text-center">
                    <span class="grey--text">데이터가 없습니다.</span>
                  </td>
                </tr>
                <tr
                  v-for="item in items"
                  :key="item.id"
                  class="sortableTable"
                  v-else
                >
                  <td>
                    <v-btn icon v-if="hasWriteAuthority">
                      <v-icon class="drag-handle"> mdi-sort</v-icon>
                    </v-btn>
                    <a
                      class="text--anchor"
                      @click="showEditDialog({ ...item })"
                      v-text="item.value"
                    />
                  </td>
                  <td v-text="item.text" />
                  <td class="text-center">
                    <CheckboxMarker :value="item.availableFlag" />
                  </td>
                  <td class="text-center">
                    {{ formatDatetime(item.updated) }}
                  </td>
                  <td class="text-center my-0" v-if="hasDeleteAuthority">
                    <div class="actions">
                      <v-btn icon @click="remove(item)">
                        <v-icon color="error"> mdi-delete-outline</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
          <CodeEditDialog
            v-model="editItem"
            :dialog.sync="dialog"
            @created="onCreated"
            @updated="onUpdated"
            v-if="dialog"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import PageTitle from "@/components/title/PageTitle.vue";
import DataTableFilter from "@/components/datatable/DataTableFilter.vue";
import { deleteApi, getApi, patchApi } from "@/utils/apis";
import CodeEditDialog from "@/views/management/code/CodeEditDialog.vue";
import { confirmDelete } from "@/utils/alerts";
import { defaultCode } from "@/definitions/defaults";
import type { Code, UpdateDisplayOrder } from "@/definitions/models";
import { computed, onMounted, ref, watch } from "vue";
import useListDialog from "@/composition/useListDialog";
import useList from "@/composition/useList";
import CheckboxMarker from "@/components/datatable/CheckboxMarker.vue";
import Sortable, { SortableEvent } from "sortablejs";
import { formatDatetime } from "@/utils/formatter";
import { useCurrentElement } from "@vueuse/core";
import { Filter, FilterOutput } from "@/definitions/types";
import { FILTER_TYPE } from "@/definitions/selections";
import { useAuthorityStore } from "@/stores/authority";

const { hasWriteAuthority, hasDeleteAuthority } = useAuthorityStore();

const filterOutput = ref<FilterOutput>({});
const currentType = computed(() =>
  typeof filterOutput.value.type?.[0] === "string"
    ? filterOutput.value.type[0]
    : "",
);

const types = ref<string[]>([]);
const saving = ref(false);
const defaultCheckedType = computed(() => types.value[0]);

const { items, loading, totalItems } = useList<Code>();
const { editItem, showEditDialog, showAddDialog, dialog } = useListDialog<Code>(
  () => ({
    ...defaultCode(),
    type: currentType.value,
    displayOrder: items.value.length + 1,
  }),
);

const filters = computed((): Filter[] => [
  {
    type: FILTER_TYPE.CHECKBOX,
    text: "타입",
    key: "type",
    single: true,
    required: true,
    items: types.value.map((v) => ({
      value: v,
      text: v,
      checked: false,
    })),
  },
]);

async function fetchList(): Promise<void> {
  items.value = [];
  totalItems.value = 0;
  loading.value = true;
  const response = await getApi<Code[]>(`codes/?type=${currentType.value}`);
  loading.value = false;
  items.value = response.data ?? ([] as Code[]);
  totalItems.value = response.data?.length || 0;
}

async function fetchTypes(): Promise<void> {
  types.value = [];
  const response = await getApi<string[]>("codes/types/");
  types.value = response.data ?? [];
}

async function saveItems(): Promise<void> {
  loading.value = true;
  const response = await patchApi<Code[]>(
    `codes/display-orders/?type=${currentType.value}`,
    items.value.map(
      ({ id }, index): UpdateDisplayOrder => ({
        id: id as number,
        displayOrder: index + 1,
      }),
    ),
  );
  loading.value = false;
  if (response.success) {
    window.sessionStorage.removeItem(`code__${currentType.value}`);
    items.value = response.data ?? [];
  }
}

async function onCreated(): Promise<void> {
  const cachedType = currentType.value;
  await fetchTypes();
  checkFilter(cachedType || defaultCheckedType.value);
}

async function onUpdated(): Promise<void> {
  const cachedType = currentType.value;
  await fetchTypes();
  checkFilter(
    types.value.includes(cachedType) ? cachedType : defaultCheckedType.value,
  );
}

async function remove(value: Code): Promise<void> {
  const result = await confirmDelete(`코드: ${value.value}`);
  if (result) {
    loading.value = true;
    const response = await deleteApi<Code>(`codes/${value.id}`);
    loading.value = false;
    if (response.success) {
      window.sessionStorage.removeItem(`code__${value.type}`);
      const cachedType = currentType.value;
      await fetchTypes();
      checkFilter(
        types.value.includes(cachedType)
          ? cachedType
          : defaultCheckedType.value,
      );
    }
  }
}

function checkFilter(value: string): void {
  filters.value
    .find((f) => f.key === "type")
    ?.items.forEach((i) => (i.checked = i.value === value));
}

watch(
  () => currentType.value,
  async (): Promise<void> => {
    await fetchList();
  },
);

onMounted(() => {
  const querySelector = useCurrentElement().value.querySelector(
    ".sortableTable tbody",
  ) as HTMLElement;
  Sortable.create(querySelector, {
    handle: ".drag-handle",
    animation: 500,
    onEnd(evt: SortableEvent) {
      if (
        evt.oldIndex !== undefined &&
        evt.newIndex !== undefined &&
        evt.newIndex != evt.oldIndex
      ) {
        const newArray = [...items.value];
        const rowSelected = newArray.splice(evt.oldIndex, 1)[0];
        newArray.splice(evt.newIndex, 0, rowSelected);
        items.value = newArray;
      }
    },
  });
});
onMounted(async () => {
  await fetchTypes();
  checkFilter(defaultCheckedType.value);
});
</script>
