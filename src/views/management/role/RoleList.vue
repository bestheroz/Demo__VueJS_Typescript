<template>
  <div>
    <page-title
      @click="showAddDialog"
      :more-actions="$store.getters.writeAuthority"
    >
      <template #list>
        <v-list>
          <v-list-item>
            <v-btn @click="saveAll">
              <v-icon class="drag-handle"> mdi-sort </v-icon> 순서저장
            </v-btn>
          </v-list-item>
        </v-list>
      </template>
    </page-title>
    <v-card :loading="loading || saving">
      <v-card-text>
        <role-nested-draggable
          v-model="items"
          @click:edit="(item) => showEditDialog(item)"
          @click:delete="(item) => onDelete(item)"
        />
      </v-card-text>
    </v-card>
    <role-edit-dialog
      v-model="editItem"
      :dialog.sync="dialog"
      @created="onCreated"
      @updated="onUpdated"
      v-if="dialog"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { deleteApi, getApi, postApi } from "@/utils/apis";
import { confirmDelete } from "@/utils/alerts";
import RoleEditDialog from "@/views/management/role/RoleEditDialog.vue";
import { defaultRole } from "@/definitions/defaults";
import { cloneDeep } from "lodash-es";
import type { Role } from "@/definitions/models";
import PageTitle from "@/components/title/PageTitle.vue";
import RoleNestedDraggable from "@/views/management/role/RoleNestedDraggable.vue";

@Component({
  components: {
    RoleNestedDraggable,
    PageTitle,
    RoleEditDialog,
  },
})
export default class extends Vue {
  @Prop() readonly height!: number | string;

  items: Role[] = [];
  loading = false;
  saving = false;
  drag = false;

  editItem: Role = defaultRole();
  dialog = false;

  protected mounted(): void {
    this.getList();
  }

  public async getList(): Promise<void> {
    this.items = [];
    this.loading = true;
    const response = await getApi<Role[]>("roles/");
    this.loading = false;
    this.items = response.data || [];
  }

  protected onCreated(value: Role): void {
    this.items = [...this.items, value];
  }

  protected onUpdated(value: Role): void {
    this.changeUpdateItemRecursive(this.items, value);
  }

  protected changeUpdateItemRecursive(items: Role[], value: Role): boolean {
    if (items.some((item) => item.id === value.id)) {
      items.splice(
        items.findIndex((item) => item.id === value.id),
        1,
        value,
      );
      return true;
    } else {
      for (const item of items) {
        if (this.changeUpdateItemRecursive(item.children, value)) {
          return true;
        }
      }
      return false;
    }
  }

  public showAddDialog(): void {
    this.editItem = defaultRole();
    this.dialog = true;
  }
  protected showEditDialog(value: Role): void {
    this.editItem = cloneDeep(value);
    this.dialog = true;
  }

  protected async onDelete(value: Role): Promise<void> {
    const result = await confirmDelete(`역할명: ${value.name}`);
    if (result.value) {
      this.saving = true;
      const response = await deleteApi<Role>(`roles/${value.id}/`);
      this.saving = false;
      if (response.code.startsWith("S")) {
        this.getList().then();
      }
    }
  }

  public async saveAll(): Promise<void> {
    this.saving = true;
    const response = await postApi<Role[]>("roles/save-all", this.items);
    this.saving = false;
    if (response.code.startsWith("S")) {
      this.items = response.data || [];
    }
  }
}
</script>
