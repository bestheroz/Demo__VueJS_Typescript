<template>
  <div>
    <v-card>
      <v-card-text>
        <v-data-table
          v-model="selected"
          must-sort
          fixed-header
          :loading="loading"
          :headers="headers"
          :items="filteredItems"
          :sort-by="sortBy"
          :sort-desc="sortDesc"
          item-key="value"
          single-select
          show-select
          :footer-props="envs.FOOTER_PROPS_MAX_100"
        >
          <template #header>
            <data-table-client-side-filter
              :headers="headers"
              :output.sync="filteredItems"
              :input="items"
            />
          </template>
          <template #[`item.value`]="{ item }">
            <span class="text--anchor" @click="showEditDialog(item)">
              {{ item.value }}
            </span>
          </template>
          <template #[`item.available`]="{ item }">
            <v-icon v-if="item.available" small color="success">
              mdi-check-circle
            </v-icon>
            <v-icon v-else small> mdi-circle-outline </v-icon>
          </template>
          <template v-if="AUTHORITY" #[`item.authority`]="{ item }">
            <v-chip
              v-text="getTextOfSelectItem(AUTHORITY, authority.authorityId)"
              v-for="authority in item.authorities"
              :key="authority.id"
              color="primary"
              small
            />
          </template>
          <template #[`item.updatedBy`]="{ item }">
            {{ item.updatedBy | formatMemberNm }}
          </template>
          <template #[`item.updated`]="{ item }">
            {{ item.updated | formatDatetime }}
          </template>
          <template #[`item.actions`]="{ item }">
            <v-btn icon @click="remove(item)">
              <v-icon color="error"> mdi-delete-outline </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
      <code-edit-dialog
        v-model="editItem"
        :dialog.sync="dialog"
        @created="onCreated"
        @updated="onUpdated"
        v-if="dialog"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";
import type { DataTableHeader, SelectItem } from "@/definitions/types";
import { deleteApi, getApi } from "@/utils/apis";
import envs from "@/constants/envs";
import DataTableClientSideFilter from "@/components/datatable/DataTableClientSideFilter.vue";
import qs from "querystring";
import CodeEditDialog from "@/views/admin/code/CodeEditDialog.vue";
import { confirmDelete } from "@/utils/alerts";
import { defaultCode } from "@/definitions/defaults";
import type { Code } from "@/definitions/models";
import _ from "lodash";
import { getTextOfSelectItem } from "@/utils/codes";

@Component({
  components: {
    CodeEditDialog,
    DataTableClientSideFilter,
  },
})
export default class extends Vue {
  @Prop({ required: true }) readonly type!: string;

  readonly envs: typeof envs = envs;
  readonly getTextOfSelectItem = getTextOfSelectItem;

  selected: Code[] = [];
  AUTHORITY: SelectItem<number>[] = [];
  saving = false;
  loading = false;
  sortBy: string[] = ["displayOrder"];
  sortDesc: boolean[] = [false];
  items: Code[] = [];
  filteredItems: Code[] = [];
  dialog = false;
  editItem: Code = defaultCode();

  get headers(): DataTableHeader[] {
    return [
      {
        text: "코드",
        align: "start",
        value: "value",
      },
      {
        text: "코드명",
        align: "start",
        value: "name",
      },
      {
        text: "사용 가능",
        align: "center",
        value: "available",
        filterType: "switch",
        width: "6rem",
      },
      {
        text: "출력 순서",
        align: "end",
        value: "displayOrder",
        width: "6rem",
      },
      {
        text: "권한",
        align: "center",
        value: "authority",
        filterType: "select",
        filterSelectItem: this.AUTHORITY.filter((a) => a.value !== 1),
      },
      {
        text: "작업 일시",
        align: "center",
        value: "updated",
        filterable: false,
        width: "11rem",
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
        filterable: false,
        sortable: false,
      },
    ];
  }

  protected async created(): Promise<void> {
    const response = await getApi<SelectItem<number>[]>("auth/codes");
    this.AUTHORITY = response.data || [];
  }

  @Watch("type")
  public async getList(): Promise<void> {
    this.selected = [];
    this.items = [];
    if (this.type) {
      this.loading = true;
      const response = await getApi<Code[]>(
        `admin/codes/?${qs.stringify({ type: this.type })}`,
      );
      this.loading = false;
      this.items = response?.data || [];
    }
  }

  @Emit("created")
  protected onCreated(value: Code): Code {
    this.items = [value, ...this.items];
    return value;
  }

  protected onUpdated(value: Code): void {
    const findIndex = this.items.findIndex(
      (item) => item.id === this.editItem.id,
    );
    this.items = [
      ...this.items.slice(0, findIndex),
      value,
      ...this.items.slice(findIndex + 1),
    ];
  }
  public showAddDialog(): void {
    this.editItem = { ...defaultCode(), type: this.type };
    this.dialog = true;
  }

  protected showEditDialog(value: Code): void {
    this.editItem = _.cloneDeep(value);
    this.dialog = true;
  }

  protected async remove(value: Code): Promise<void> {
    const result = await confirmDelete(undefined, `코드: ${value.value}`);
    if (result.value) {
      this.saving = true;
      const response = await deleteApi<Code>(`admin/codes/${value.id}/`);
      this.saving = false;
      if (response?.code?.startsWith("S")) {
        window.localStorage.removeItem(`code__${value.id}`);
        this.items = this.items.filter(
          (item) => item.id !== (response.data?.id || 0),
        );
      }
    }
  }
}
</script>
