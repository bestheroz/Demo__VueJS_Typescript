<template>
  <div>
    <PageTitle :button-loading="saving" @click="showAddDialog">
      <template #more-buttons>
        <v-btn
          tile
          v-if="hasExcelAuthority"
          color="primary"
          outlined
          large
          @click="excel"
        >
          <v-icon> mdi-file-excel</v-icon>
          엑셀다운로드
        </v-btn>
        <v-btn tile color="primary" outlined large @click="fetchList">
          <v-icon> mdi-refresh</v-icon>
          새로고침
        </v-btn>
      </template>
    </PageTitle>
    <v-card>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12" sm="7">
            <DataTableFilter :filters="filters" :output.sync="filterOutput" />
          </v-col>
          <v-spacer />
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="search"
              label="검색 (ID, 관리자 아이디, 관리자 이름)"
              prepend-inner-icon="mdi-magnify"
              clearable
              filled
              dense
            />
          </v-col>
        </v-row>
        <v-data-table
          must-sort
          fixed-header
          :loading="loading"
          :headers="headers"
          :items="items"
          :server-items-length="totalItems"
          :options.sync="pagination"
          item-key="id"
          :height="height"
          :footer-props="envs.FOOTER_PROPS_MAX_100"
        >
          <template #[`item.loginId`]="{ item }">
            <a
              class="text--anchor"
              @click="showEditDialog({ ...item, password: undefined })"
              v-text="item.loginId"
            />
          </template>
          <template #[`item.availableFlag`]="{ item }">
            <CheckboxMarker :value="item.availableFlag" />
          </template>
          <template #[`item.availableSignIn`]="{ item }">
            <CheckboxMarker
              :value="
                item.availableFlag &&
                item.role.availableFlag &&
                dayjs(item.expired).isAfter(dayjs())
              "
            />
          </template>
          <template #[`item.expired`]="{ item }">
            {{ formatDatetime(item.expired) }}
          </template>
          <template v-if="hasDeleteAuthority" #[`item.actions`]="{ item }">
            <v-btn tile v-if="id !== item.id" icon @click="remove(item)">
              <v-icon color="error"> mdi-delete-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <AdminEditDialog
      v-if="dialog"
      v-model="editItem"
      :dialog.sync="dialog"
      @created="fetchList"
      @updated="fetchList"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import envs from "@/constants/envs";
import type { Filter, PageResult, SelectItem } from "@/definitions/types";
import { deleteApi, downloadExcelApi, getApi } from "@/utils/apis";
import AdminEditDialog from "@/views/management/admin/AdminEditDialog.vue";
import { defaultAdmin } from "@/definitions/defaults";
import type { Admin, Role } from "@/definitions/models";
import PageTitle from "@/components/title/PageTitle.vue";
import { BooleanTypes, FILTER_TYPE } from "@/definitions/selections";
import DataTableFilter from "@/components/datatable/DataTableFilter.vue";
import { computed, onMounted, ref } from "vue";
import { confirmDelete } from "@/utils/alerts";
import useListDialog from "@/composition/useListDialog";
import type { DataTableHeader } from "vuetify";
import useDatatable from "@/composition/useDatatable";
import qs from "qs";
import CheckboxMarker from "@/components/datatable/CheckboxMarker.vue";
import { formatDatetime } from "@/utils/formatter";
import { watchDebounced } from "@vueuse/core";
import { useAuthorityStore } from "@/stores/authority";
import { useAdminStore } from "@/stores/admin";

defineProps<{
  height?: number | string;
}>();

const { hasDeleteAuthority, hasExcelAuthority } = useAuthorityStore();
const { id } = useAdminStore();

const { editItem, dialog, showEditDialog, showAddDialog } =
  useListDialog<Admin>(defaultAdmin);

const {
  pagination,
  items,
  totalItems,
  loading,
  search,
  filterOutput,
  queryString,
} = useDatatable<Admin>();

const saving = ref(false);
const roles = ref<SelectItem<number>[]>([]);

async function fetchList(): Promise<void> {
  items.value = [];
  totalItems.value = 0;
  loading.value = true;

  const response = await getApi<PageResult<Admin>>(
    `admins/?${queryString.value}`,
  );
  loading.value = false;
  items.value = response.data?.content ?? ([] as Admin[]);
  totalItems.value = response.data?.totalElements ?? 0;
}

const headers = computed((): DataTableHeader[] => {
  let headers: DataTableHeader[] = [
    {
      text: "ID",
      align: "start",
      value: "id",
      width: "6rem",
    },
    {
      text: "관리자 아이디",
      align: "start",
      value: "loginId",
    },
    {
      text: "관리자 이름",
      align: "start",
      value: "name",
    },
    {
      text: "역할",
      align: "center",
      value: "role.name",
    },
    {
      text: "만료일",
      align: "center",
      value: "expired",
      width: "11.5rem",
    },
    {
      text: "사용 가능",
      align: "center",
      value: "availableFlag",
      width: "5rem",
    },
    {
      text: "로그인 가능",
      align: "center",
      value: "availableSignIn",
      width: "5rem",
      sortable: false,
    },
  ];
  if (hasDeleteAuthority) {
    headers = [
      ...headers,
      {
        text: "Action",
        align: "center",
        value: "actions",
        sortable: false,
        width: "5rem",
      },
    ];
  }
  return headers;
});

const filters = computed((): Filter[] => [
  {
    type: FILTER_TYPE.CHECKBOX,
    text: "권한",
    key: "roleIdList",
    items: roles.value.map((v) => {
      return { ...v, checked: false };
    }),
  },
  {
    type: FILTER_TYPE.CHECKBOX,
    text: "사용 가능",
    key: "availableFlagList",
    items: BooleanTypes.map((v) => {
      return { ...v, checked: false };
    }),
    single: true,
  },
]);
const queryStringForExcel = computed((): string =>
  qs.stringify({
    search: search.value,
    ...filterOutput.value,
    ...pagination.value,
    page: 1,
    itemsPerPage: 99999999,
  }),
);

async function excel(): Promise<void> {
  saving.value = true;
  await downloadExcelApi(`excel/admins?${queryStringForExcel.value}`);
  saving.value = false;
}

async function remove(value: Admin): Promise<void> {
  const result = await confirmDelete(`${value.loginId}를 지우시겠습니까? `);
  if (result) {
    saving.value = true;
    const response = await deleteApi<Admin>(`admins/${value.id}`);
    saving.value = false;
    if (response.success) {
      await fetchList();
    }
  }
}

onMounted(async () => {
  const response = await getApi<Role[]>("roles/selections/");
  roles.value = response.data.map((v) => {
    return { value: v.id || 0, text: v.name };
  });
});

watchDebounced(
  () => queryString.value,
  async () => await fetchList(),
  {
    debounce: 200,
  },
);
</script>
