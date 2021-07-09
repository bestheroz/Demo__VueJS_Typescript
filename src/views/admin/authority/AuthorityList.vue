<template>
  <div>
    <v-card flat :loading="loading">
      <v-card-text>
        <v-row dense>
          <v-col cols="5">
            <v-list dense>
              <draggable
                tag="div"
                v-model="items"
                v-bind="dragOptions"
                handle=".drag-handle"
                @end="onDraggableEnd"
              >
                <transition-group type="transition" name="flip-list">
                  <v-list-item
                    :key="item.displayOrder"
                    v-for="item in items"
                    class="elevation-1 bottom-solid"
                  >
                    <v-list-item-icon>
                      <v-icon v-text="item.menu.icon" />
                    </v-list-item-icon>
                    <v-list-item-content
                      style="display: inline-block"
                      class="py-0"
                    >
                      <v-btn icon v-if="$store.getters.writeAuthority">
                        <v-icon class="drag-handle"> mdi-sort </v-icon>
                      </v-btn>
                      {{ item.menu.name }}
                    </v-list-item-content>
                    <br />
                    <v-chip-group multiple v-model="item.typesJson">
                      <v-chip
                        :value="AUTHORITY_ITEM_TYPE.VIEW"
                        color="primary"
                        disabled
                      >
                        <v-icon size="24">mdi-eye</v-icon>
                      </v-chip>
                      <v-chip
                        :outlined="
                          !item.typesJson.includes(AUTHORITY_ITEM_TYPE.WRITE)
                        "
                        color="primary"
                        :value="AUTHORITY_ITEM_TYPE.WRITE"
                      >
                        <v-icon size="24">mdi-content-save-outline</v-icon>
                      </v-chip>
                      <v-chip
                        :outlined="
                          !item.typesJson.includes(AUTHORITY_ITEM_TYPE.DELETE)
                        "
                        color="primary"
                        :value="AUTHORITY_ITEM_TYPE.DELETE"
                      >
                        <v-icon size="24">mdi-delete-outline</v-icon>
                      </v-chip>
                    </v-chip-group>
                  </v-list-item>
                </transition-group>
              </draggable>
            </v-list>
          </v-col>
          <v-col cols="7">
            <v-card-text class="py-0 elevation-1">
              <v-chip-group
                v-model="selected"
                multiple
                column
                @change="onChangeSelectedChip"
              >
                <v-chip
                  v-for="item in menus"
                  :value="item.id"
                  :key="item.id"
                  :outlined="!selected.includes(item.id)"
                  color="primary"
                  class="px-4"
                >
                  <v-icon
                    v-text="item.icon"
                    v-if="item.icon"
                    class="pr-2"
                    size="24"
                  />
                  {{ item.name }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, VModel, Vue, Watch } from "vue-property-decorator";
import { getApi, postApi } from "@/utils/apis";
import draggable from "vuedraggable";
import type { AuthorityItem, Menu } from "@/definitions/models";
import { AUTHORITY_ITEM_TYPE, MENU_TYPE } from "@/definitions/selections";
import { defaultAuthorityItem } from "@/definitions/defaults";

@Component({
  components: { draggable },
})
export default class extends Vue {
  @VModel({ required: true }) vModel!: string;

  items: AuthorityItem[] = [];
  menus: Menu[] = [];
  selected: number[] = [];
  loading = false;
  saving = false;
  drag = false;

  readonly AUTHORITY_ITEM_TYPE = AUTHORITY_ITEM_TYPE;

  get dragOptions(): { animation: number } {
    return {
      animation: 200,
    };
  }

  protected async created(): Promise<void> {
    const response = await getApi<Menu[]>("admin/menus/");
    this.menus = response?.data || [];
  }

  @Watch("vModel")
  protected async watchItem(val: string): Promise<void> {
    this.loading = true;
    const response = await getApi<AuthorityItem[]>(`admin/authorities/${val}`);
    this.loading = false;
    this.items = response.data;
    this.selected =
      this.items
        .filter((item) => this.menus.find((menu) => menu.id === item.menu.id))
        .map((item) => item.menu.id || 0) || [];
  }

  protected onDraggableEnd(): void {
    this.items = this.items.map((item, index) => {
      return { ...item, displayOrder: index + 1 };
    });
  }

  protected onChangeSelectedChip(selected: number[]): void {
    this.items = selected.map((selectedId, index) => {
      const foundMenu = this.menus.find((m) => m.id === selectedId) || {
        type: "",
      };
      return {
        ...(this.items.find((item) => item.menu.id === selectedId) || {
          ...defaultAuthorityItem(),
          menu: foundMenu,
          typesJson:
            foundMenu.type === MENU_TYPE.G
              ? [
                  AUTHORITY_ITEM_TYPE.VIEW,
                  AUTHORITY_ITEM_TYPE.WRITE,
                  AUTHORITY_ITEM_TYPE.DELETE,
                ]
              : [AUTHORITY_ITEM_TYPE.VIEW],
        }),
        displayOrder: index + 1,
      } as AuthorityItem;
    });
  }

  public async saveItems(): Promise<void> {
    this.saving = true;
    const response = await postApi<AuthorityItem[]>(
      `admin/authorities/${this.vModel}`,
      this.items,
    );
    this.saving = false;
    if (response?.code?.startsWith("S") && response.data) {
      await this.$store.dispatch("resetAuthority");
      this.items = response.data;
    }
  }
}
</script>
