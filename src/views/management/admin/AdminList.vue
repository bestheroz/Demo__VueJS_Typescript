<template>
  <div>
    <page-title @click="showAddDialog" more-actions>
      <template #list>
        <v-list>
          <v-list-item>
            <v-btn @click="excel" v-if="$store.getters.excelAuthority">
              <v-icon> mdi-file-excel </v-icon> 엑셀다운로드
            </v-btn>
          </v-list-item>
        </v-list>
      </template>
    </page-title>
    <v-card>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12" sm="7">
            <data-table-filter v-model="filters" :output.sync="filterOutput" />
          </v-col>
          <v-spacer />
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="search"
              solo
              label="검색 (관리자 아이디, 관리자 이름)"
              prepend-inner-icon="mdi-magnify"
              clearable
              outlined
              hide-details="auto"
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
          <template #[`item.adminId`]="{ item }">
            <a
              class="text--anchor"
              @click="showEditDialog({ ...item, password: undefined })"
              v-text="item.adminId"
            />
          </template>
          <template #[`item.available`]="{ item }">
            <v-icon v-if="item.available" color="success">
              mdi-check-circle
            </v-icon>
            <v-icon v-else> mdi-circle-outline </v-icon>
          </template>
          <template #[`item.availableSignIn`]="{ item }">
            <v-icon
              v-if="item.available && dayjs(item.expired).isAfter(dayjs())"
              color="success"
            >
              mdi-check-circle
            </v-icon>
            <v-icon v-else> mdi-circle-outline </v-icon>
          </template>
          <template v-if="roles" #[`item.roleId`]="{ item }">
            <span v-text="getTextOfSelectItem(roles, item.role.id)" />
          </template>
          <template #[`item.expired`]="{ item }">
            {{ item.expired | formatDatetime }}
          </template>
          <template #[`item.updated`]="{ item }">
            {{ item.updated | formatDatetime }}
          </template>
          <template #[`item.updatedBy`]="{ item }">
            {{ item.updatedBy | formatAdminNm }}
          </template>
          <template #[`item.actions`]="{ item }">
            <v-btn icon @click="remove(item)">
              <v-icon color="error"> mdi-delete-outline </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <admin-edit-dialog
      v-model="editItem"
      :dialog.sync="dialog"
      @created="onCreated"
      @updated="onUpdated"
      v-if="dialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import type { Filter, PageResult, Pagination } from "@/definitions/types";
import { SelectItem } from "@/definitions/types";
import { deleteApi, downloadExcelApi, getApi } from "@/utils/apis";
import envs from "@/constants/envs";
import AdminEditDialog from "@/views/management/admin/AdminEditDialog.vue";
import { confirmDelete } from "@/utils/alerts";
import qs from "qs";
import { defaultAdmin } from "@/definitions/defaults";
import type { Admin } from "@/definitions/models";
import { cloneDeep, debounce } from "lodash-es";
import { getTextOfSelectItem } from "@/utils/codes";
import PageTitle from "@/components/title/PageTitle.vue";
import dayjs from "dayjs";
import { BooleanTypes } from "@/definitions/selections";
import DataTableFilter from "@/components/datatable/DataTableFilter.vue";
import { DataTableHeader } from "vuetify";

@Component({
  components: {
    DataTableFilter,
    PageTitle,
    AdminEditDialog,
  },
})
export default class AdminList extends Vue {
  @Prop() readonly height!: number | string;

  readonly envs: typeof envs = envs;
  readonly dayjs = dayjs;
  readonly getTextOfSelectItem = getTextOfSelectItem;

  pagination: Pagination = {
    page: 1,
    sortBy: ["updated"],
    sortDesc: [true],
    itemsPerPage: 10,
  };

  items: Admin[] = [];
  totalItems = 0;
  loading = false;
  saving = false;
  editItem: Admin = defaultAdmin();
  dialog = false;

  search = "";
  roles: SelectItem<number>[] = [];
  filterOutput: Record<string, string | number | boolean[]> = {};
  filters: Filter[] = [
    {
      type: "checkbox",
      text: "권한",
      key: "roleList",
      items: this.roles.map((v) => {
        return { ...v, checked: false };
      }),
    },
    {
      type: "checkbox",
      text: "사용 가능",
      key: "availableList",
      items: BooleanTypes.map((v) => {
        return { ...v, checked: false };
      }),
      single: true,
    },
  ];

  get headers(): DataTableHeader[] {
    let headers: DataTableHeader[] = [
      {
        text: "#key",
        align: "start",
        value: "id",
      },
      {
        text: "관리자 아이디",
        align: "start",
        value: "adminId",
      },
      {
        text: "관리자 이름",
        align: "start",
        value: "name",
      },
      {
        text: "권한",
        align: "center",
        value: "roleId",
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
        value: "available",
        width: "6rem",
      },
      {
        text: "로그인 가능",
        align: "center",
        value: "availableSignIn",
        width: "6rem",
      },
      {
        text: "작업 일시",
        align: "center",
        value: "updated",
        width: "11.5rem",
      },
      {
        text: "작업자",
        align: "start",
        value: "updatedBy",
        width: "8rem",
      },
    ];
    if (this.$store.getters.deleteAuthority) {
      headers = [
        ...headers,
        {
          text: "Action",
          align: "center",
          value: "actions",
          width: "5rem",
          sortable: false,
        },
      ];
    }
    return headers;
  }

  get queryString(): string {
    return qs.stringify({
      search: this.search,
      ...this.filterOutput,
      ...this.pagination,
    });
  }

  protected async created(): Promise<void> {
    const response = await getApi<SelectItem<number>[]>("roles/codes");
    this.roles = response.data;
  }

  @Watch("queryString", { immediate: true })
  public async getList(): Promise<void> {
    this.items = [];
    this.totalItems = 0;
    this.loading = true;
    this.fetchList();
  }

  protected fetchList = debounce(async function (this: AdminList) {
    const response = await getApi<PageResult<Admin>>(
      `admins/?${this.queryString}`,
    );
    this.loading = false;
    this.items = response.data.content || [];
    this.totalItems = response.data.totalElements;
  }, 300);

  protected onCreated(value: Admin): void {
    this.items = [value, ...this.items];
    this.totalItems++;
  }

  protected onUpdated(value: Admin): void {
    this.items.splice(
      this.items.findIndex((item) => item.id === this.editItem.id),
      1,
      value,
    );
  }
  protected showAddDialog(): void {
    this.editItem = defaultAdmin();
    this.dialog = true;
  }

  protected showEditDialog(value: Admin): void {
    this.editItem = cloneDeep(value);
    this.dialog = true;
  }

  protected async remove(value: Admin): Promise<void> {
    const result = await confirmDelete(`관리자 아이디: ${value.adminId}`);
    if (result.value) {
      this.saving = true;
      const response = await deleteApi<Admin>(`admins/${value.id}/`);
      this.saving = false;
      if (response.code.startsWith("S")) {
        await this.$store.dispatch("reloadAdminCodes");
        this.items = this.items.filter((item) => item.id !== (value.id || 0));
        this.totalItems--;
      }
    }
  }

  protected async excel(): Promise<void> {
    this.saving = true;
    await downloadExcelApi("excel/admins");
    this.saving = false;
  }
}
</script>
