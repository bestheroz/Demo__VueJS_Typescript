<template>
  <div>
    <page-title @click="showAddDialog" />
    <v-card>
      <v-card-text>
        <v-data-table
          v-model="selected"
          must-sort
          fixed-header
          :loading="loading"
          :headers="headers"
          :items="items"
          :options.sync="pagination"
          item-key="id"
          single-select
          show-select
          :height="height"
          :footer-props="envs.FOOTER_PROPS_MAX_100"
        >
          <template #header>
            <data-table-filter
              :headers="headers"
              :filter.sync="datatableFilter"
            />
          </template>
          <template #[`item.userId`]="{ item }">
            <a
              class="text--anchor"
              @click="showEditDialog({ ...item, password: undefined })"
            >
              {{ item.userId }}
            </a>
          </template>
          <template #[`item.available`]="{ item }">
            <v-icon v-if="item.available" small color="success">
              mdi-check-circle
            </v-icon>
            <v-icon v-else small> mdi-circle-outline </v-icon>
          </template>
          <template #[`item.loginable`]="{ item }">
            <v-icon
              v-if="item.available && dayjs(item.expired).isAfter(dayjs())"
              small
              color="success"
            >
              mdi-check-circle
            </v-icon>
            <v-icon v-else small> mdi-circle-outline </v-icon>
          </template>
          <template v-if="AUTHORITY" #[`item.authorityId`]="{ item }">
            <v-chip
              v-text="getTextOfSelectItem(AUTHORITY, item.authorityId)"
              color="primary"
              small
            />
          </template>
          <template #[`item.expired`]="{ item }">
            {{ item.expired | formatDatetime }}
          </template>
          <template #[`item.updated`]="{ item }">
            {{ item.updated | formatDatetime }}
          </template>
          <template #[`item.updatedBy`]="{ item }">
            {{ item.updatedBy | formatMemberNm }}
          </template>
          <template #[`item.actions`]="{ item }">
            <v-btn icon @click="remove(item)">
              <v-icon color="error"> mdi-delete-outline </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <member-edit-dialog
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
import type {
  DataTableHeader,
  PageResult,
  Pagination,
  SelectItem,
} from "@/definitions/types";
import { deleteApi, getApi, getFileApi } from "@/utils/apis";
import envs from "@/constants/envs";
import MemberEditDialog from "@/views/admin/member/MemberEditDialog.vue";
import { confirmDelete } from "@/utils/alerts";
import DataTableFilter from "@/components/datatable/DataTableFilter.vue";
import qs from "qs";
import { defaultMember } from "@/definitions/defaults";
import type { Member } from "@/definitions/models";
import { cloneDeep } from "lodash-es";
import { getTextOfSelectItem } from "@/utils/codes";
import PageTitle from "@/components/title/PageTitle.vue";
import dayjs from "dayjs";

@Component({
  components: {
    PageTitle,
    DataTableFilter,
    MemberEditDialog,
  },
})
export default class extends Vue {
  @Prop() readonly height!: number | string;

  readonly dayjs = dayjs;
  readonly envs: typeof envs = envs;
  readonly getTextOfSelectItem = getTextOfSelectItem;
  selected: Member[] = [];
  pagination: Pagination = {
    page: 1,
    sortBy: ["authorityId"],
    sortDesc: [true],
    itemsPerPage: 20,
  };

  items: Member[] = [];
  loading = false;
  saving = false;
  editItem: Member = defaultMember();
  AUTHORITY: SelectItem<number>[] = [];
  dialog = false;
  datatableFilter: { [p: string]: string | number } = {};

  get headers(): DataTableHeader[] {
    return [
      {
        text: "사용자아이디",
        align: "start",
        value: "userId",
      },
      {
        text: "사용자명",
        align: "start",
        value: "name",
      },
      {
        text: "권한",
        align: "center",
        value: "authorityId",
        filterType: "select",
        filterSelectItem: this.AUTHORITY,
      },
      {
        text: "만료일",
        align: "center",
        value: "expired",
        width: "11.5rem",
        filterable: false,
      },
      {
        text: "사용 가능",
        align: "center",
        value: "available",
        filterType: "switch",
        width: "6rem",
      },
      {
        text: "로그인 가능",
        align: "center",
        value: "loginable",
        width: "6rem",
      },
      {
        text: "작업 일시",
        align: "center",
        value: "updated",
        filterable: false,
        width: "11.5rem",
      },
      {
        text: "작업자",
        align: "start",
        value: "updatedBy",
        filterable: false,
        width: "8rem",
      },
      {
        text: "",
        align: "center",
        value: "actions",
        width: "5rem",
        filterable: false,
        sortable: false,
      },
    ];
  }

  get queryString(): string {
    return qs.stringify({
      filter: this.datatableFilter,
      ...this.pagination,
    });
  }

  protected async created(): Promise<void> {
    const response = await getApi<SelectItem<number>[]>("auth/codes");
    this.AUTHORITY = response.data || [];
  }

  @Watch("queryString")
  public async getList(): Promise<void> {
    this.selected = [];
    this.items = [];
    this.loading = true;
    const response = await getApi<PageResult<Member>>(
      `admin/members/?${this.queryString}`,
    );
    this.loading = false;
    this.items = response?.data?.content || [];
  }

  protected onCreated(value: Member): void {
    this.items = [value, ...this.items];
  }

  protected onUpdated(value: Member): void {
    const findIndex = this.items.findIndex(
      (item) => item.id === this.editItem.id,
    );
    this.items = [
      ...this.items.slice(0, findIndex),
      value,
      ...this.items.slice(findIndex + 1),
    ];
  }
  protected showAddDialog(): void {
    this.editItem = defaultMember();
    this.dialog = true;
  }

  protected showEditDialog(value: Member): void {
    this.editItem = cloneDeep(value);
    this.dialog = true;
  }

  protected async remove(value: Member): Promise<void> {
    const result = await confirmDelete(
      undefined,
      `사용자아이디: ${value.userId}`,
    );
    if (result.value) {
      this.saving = true;
      const response = await deleteApi<Member>(`admin/members/${value.id}/`);
      this.saving = false;
      if (response?.code?.startsWith("S")) {
        await this.$store.dispatch("resetMemberCodes");
        this.items = this.items.filter(
          (item) => item.id !== (response.data?.id || 0),
        );
      }
    }
  }

  protected async excel(): Promise<void> {
    this.saving = true;
    await getFileApi("admin/members/download/excel/");
    this.saving = false;
  }
}
</script>
