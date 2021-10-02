<template>
  <v-list>
    <draggable
      class="dragArea"
      tag="div"
      :list="items"
      :group="{ name: 'g1' }"
      v-bind="dragOptions"
      handle=".drag-handle"
    >
      <v-list-item dense :key="item.menu.id" v-for="item in items">
        <v-row no-gutters>
          <v-col>
            <v-list-item-icon>
              <v-icon v-text="item.menu.icon" style="top: 4px" />
            </v-list-item-icon>
            <v-list-item-title class="d-inline">
              <v-btn icon v-if="$store.getters.writeAuthority" small>
                <v-icon class="drag-handle"> mdi-sort </v-icon>
              </v-btn>
              {{ item.menu.name }}
            </v-list-item-title>
          </v-col>
          <v-spacer />
          <v-col class="text-right">
            <v-chip-group
              multiple
              v-model="item.authoritiesJson"
              v-if="item.menu.type !== MENU_TYPE.GROUP"
              class="d-inline-block"
            >
              <v-chip
                :value="ROLE_AUTHORITY_TYPE.VIEW"
                color="primary"
                label
                disabled
              >
                <v-icon size="24">mdi-eye</v-icon>
              </v-chip>
              <v-chip
                :outlined="
                  !item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.WRITE)
                "
                color="primary"
                :value="ROLE_AUTHORITY_TYPE.WRITE"
                label
                :disabled="!$store.getters.writeAuthority"
              >
                <v-icon size="24">mdi-content-save-outline</v-icon>
              </v-chip>
              <v-chip
                :outlined="
                  !item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.DELETE)
                "
                color="primary"
                :value="ROLE_AUTHORITY_TYPE.DELETE"
                label
                :disabled="!$store.getters.writeAuthority"
              >
                <v-icon size="24">mdi-delete-outline</v-icon>
              </v-chip>
              <v-chip
                :outlined="
                  !item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.EXCEL)
                "
                color="primary"
                :value="ROLE_AUTHORITY_TYPE.EXCEL"
                label
                :disabled="!$store.getters.excelAuthority"
              >
                <v-icon size="24">mdi-file-excel-outline</v-icon>
              </v-chip>
            </v-chip-group>
          </v-col>
          <v-col cols="12" v-if="item.menu.type === MENU_TYPE.GROUP">
            <role-menu-nested-draggable v-model="item.children" />
          </v-col>
        </v-row>
      </v-list-item>
    </draggable>
  </v-list>
</template>
<script lang="ts">
import { Component, VModel, Vue } from "vue-property-decorator";
import { RoleMenuMap } from "@/definitions/models";
import draggable from "vuedraggable";
import { ROLE_AUTHORITY_TYPE, MENU_TYPE } from "@/definitions/selections";

@Component({
  components: {
    RoleMenuNestedDraggable: () =>
      import("@/views/management/role/menu/RoleMenuNestedDraggable.vue"),
    draggable,
  },
})
export default class extends Vue {
  @VModel({ required: true, type: Array, default: () => [] })
  readonly items!: RoleMenuMap[];

  readonly ROLE_AUTHORITY_TYPE = ROLE_AUTHORITY_TYPE;
  readonly MENU_TYPE = MENU_TYPE;

  get dragOptions(): { animation: number } {
    return {
      animation: 200,
    };
  }
}
</script>
<style scoped lang="scss">
.dragArea {
  min-height: 30px;
  border: 1px dotted var(--v-secondary-base);
}
</style>
