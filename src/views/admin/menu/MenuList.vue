<template>
  <div>
    <page-title @click="showAddDialog" more-actions>
      <template #list>
        <v-list>
          <v-list-item @click="saveItems">
            <v-list-item-title>
              <v-icon class="drag-handle"> mdi-sort </v-icon> 순서저장
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </page-title>
    <v-card>
      <v-card-text>
        <v-list>
          <draggable
            tag="div"
            v-model="items"
            v-bind="dragOptions"
            handle=".drag-handle"
          >
            <transition-group type="transition" name="flip-list">
              <v-list-item
                dense
                :key="item.id"
                v-for="item in items"
                class="elevation-1 bottom-solid"
              >
                <v-list-item-icon>
                  <v-icon v-text="item.icon" />
                </v-list-item-icon>
                <v-list-item-content style="display: inline-block" class="py-0">
                  <v-btn icon>
                    <v-icon class="drag-handle"> mdi-sort </v-icon>
                  </v-btn>
                  <a class="text--anchor" @click="showEditDialog(item)">
                    {{ item.name }}
                  </a>
                </v-list-item-content>
                <v-list-item-content style="display: inline-block" class="py-0">
                  {{ item.url }}
                </v-list-item-content>
                <v-list-item-action style="display: inline-block" class="my-0">
                  <div class="actions">
                    <v-btn icon @click="onDelete(item)">
                      <v-icon color="error"> mdi-delete-outline </v-icon>
                    </v-btn>
                  </div>
                </v-list-item-action>
              </v-list-item>
            </transition-group>
          </draggable>
        </v-list>
      </v-card-text>
    </v-card>
    <menu-edit-dialog
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
import MenuEditDialog from "@/views/admin/menu/MenuEditDialog.vue";
import draggable from "vuedraggable";
import { defaultMenu } from "@/definitions/defaults";
import { cloneDeep } from "lodash-es";
import type { Menu } from "@/definitions/models";
import { MENU_TYPE } from "@/definitions/selections";
import PageTitle from "@/components/title/PageTitle.vue";

interface MenuVO extends Menu {
  children: Menu[];
}

@Component({
  components: {
    PageTitle,
    MenuEditDialog,
    draggable,
  },
})
export default class extends Vue {
  @Prop() readonly height!: number | string;

  items: Menu[] = [];
  loading = false;
  saving = false;
  drag = false;

  editItem: Menu = defaultMenu();
  dialog = false;

  get dragOptions(): { animation: number } {
    return {
      animation: 200,
    };
  }

  protected mounted(): void {
    this.getList();
  }

  public async getList(): Promise<void> {
    this.items = [];
    this.loading = true;
    const response = await getApi<MenuVO[]>("admin/menus/");
    this.loading = false;
    this.items = response?.data || [];
  }

  protected onCreated(value: Menu): void {
    this.items = [value, ...this.items];
  }

  protected onUpdated(value: Menu): void {
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
    this.editItem = defaultMenu();
    this.dialog = true;
  }
  protected showEditDialog(value: Menu): void {
    this.editItem = cloneDeep(value);
    this.dialog = true;
  }

  protected async onDelete(value: Menu): Promise<void> {
    const result = await confirmDelete(undefined, `메뉴명: ${value.name}`);
    if (result.value) {
      this.saving = true;
      const response = await deleteApi<Menu>(`admin/menus/${value.id}/`);
      this.saving = false;
      if (response?.code?.startsWith("S")) {
        await this.$store.dispatch("resetAuthority");
        this.items = this.items.filter(
          (item) => item.id !== (response.data?.id || 0),
        );
      }
    }
  }

  protected async saveItems(): Promise<void> {
    let parentId = 0;
    this.saving = true;
    const response = await postApi<Menu[]>(
      "admin/menus/save",
      this.items.map((item, index) => {
        if (item.type === MENU_TYPE.G) {
          parentId = item.id || 0;
        }
        return {
          ...item,
          displayOrder: index + 1,
          parentId: item.type === MENU_TYPE.G ? 0 : parentId,
        };
      }),
    );
    this.saving = false;
    if (response?.code?.startsWith("S")) {
      await this.$store.dispatch("resetAuthority");
      this.items = response.data || [];
    }
  }
}
</script>
<style lang="scss" scoped>
.bottom-solid {
  border-bottom: 1px solid var(--v-secondary-base);
}
</style>
