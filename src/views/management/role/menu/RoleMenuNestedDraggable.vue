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
          <v-col sm="12" lg="5">
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
          <v-col sm="12" lg="7" class="text-right">
            <v-btn-toggle
              v-model="item.authoritiesJson"
              active-class="primary"
              multiple
              v-if="item.menu.type !== MENU_TYPE.GROUP"
            >
              <v-btn
                :value="ROLE_AUTHORITY_TYPE.VIEW"
                disabled
                class="success-color"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.WRITE"
                :disabled="
                  $store.getters.writeAuthority &&
                  roleId === $store.getters.roleId
                "
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.WRITE)
                    ? 'success-color'
                    : undefined
                "
              >
                <v-icon>mdi-content-save-outline</v-icon>
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.DELETE"
                :disabled="
                  $store.getters.writeAuthority &&
                  roleId === $store.getters.roleId
                "
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.DELETE)
                    ? 'success-color'
                    : undefined
                "
              >
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>

              <v-btn
                :value="ROLE_AUTHORITY_TYPE.EXCEL"
                :disabled="
                  $store.getters.writeAuthority &&
                  roleId === $store.getters.roleId
                "
                :class="
                  item.authoritiesJson.includes(ROLE_AUTHORITY_TYPE.EXCEL)
                    ? 'success-color'
                    : undefined
                "
              >
                <v-icon>mdi-file-excel-outline</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" v-if="item.menu.type === MENU_TYPE.GROUP">
            <role-menu-nested-draggable
              v-model="item.children"
              :role-id="roleId"
            />
          </v-col>
        </v-row>
      </v-list-item>
    </draggable>
  </v-list>
</template>
<script lang="ts">
import { Component, Prop, VModel, Vue } from "vue-property-decorator";
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

  @Prop({ required: true }) roleId!: number;

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
  .v-item-group {
    .success-color {
      background-color: var(--v-primary-base) !important;
    }
  }
}
</style>